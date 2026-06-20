import { useState, useEffect, useRef } from 'react'
import { readState, writeState } from './lib/urlState.js'
import { fetchQuakeById } from './lib/usgs.js'
import { useQuakes } from './hooks/useQuakes.js'
import { useRelativeTime } from './hooks/useRelativeTime.js'
import { WorldMap } from './components/WorldMap.jsx'
import { QuakeDetail } from './components/QuakeDetail.jsx'
import { QuakeList } from './components/QuakeList.jsx'
import { Controls } from './components/Controls.jsx'
import { NearMeButton } from './components/NearMeButton.jsx'
import { ShareButton } from './components/ShareButton.jsx'

function pluralEvents(n) {
  const last2 = n % 100
  const last1 = n % 10
  if (last2 >= 11 && last2 <= 19) return 'событий'
  if (last1 === 1)                 return 'событие'
  if (last1 >= 2 && last1 <= 4)   return 'события'
  return 'событий'
}

// Read URL once at module load so useState gets the right initial values.
const _initial = readState()

export default function App() {
  const [filter, setFilter]   = useState(_initial.filter)
  const [period, setPeriod]   = useState(_initial.period)
  const [mapMode, setMapMode] = useState(_initial.mode)

  const { quakes, loading, error, lastUpdated } = useQuakes({ filter, period })
  const updatedLabel = useRelativeTime(lastUpdated)

  const [selectedId, setSelectedId]   = useState(_initial.selectedId)
  const [nearMe, setNearMe]           = useState(null)
  const [pinnedQuake, setPinnedQuake] = useState(null)

  // false while the URL's ?q= is still being validated against the feed / by-id API.
  // writeState is suppressed during this window so the original q= param is preserved.
  const [initialResolved, setInitialResolved] = useState(!_initial.selectedId)

  // Mirror quakes in a ref so the init-resolve effect can read the latest value
  // without listing quakes as a dep (which would retrigger on every 60s poll).
  const quakesRef = useRef([])
  useEffect(() => { quakesRef.current = quakes }, [quakes])

  // Sync URL state on every relevant change.
  // Suppressed until ?q= resolution is complete so the original q= param is preserved.
  useEffect(() => {
    if (!initialResolved) return
    writeState({ mode: mapMode, period, filter, selectedId })
  }, [mapMode, period, filter, selectedId, initialResolved])

  // Resolve the URL's ?q= once the first feed fetch completes.
  // If the quake is in the feed: just unblock writeState.
  // If not: fetch it by id and pin it, or clear quietly if not found.
  // Every terminal path calls setInitialResolved(true) so writeState unblocks.
  useEffect(() => {
    if (initialResolved) return
    if (loading) return

    if (!selectedId) {
      setInitialResolved(true)
      return
    }

    if (quakesRef.current.some(q => q.id === selectedId)) {
      setInitialResolved(true)
      return
    }

    const ac = new AbortController()
    fetchQuakeById(selectedId, ac.signal)
      .then(q => {
        if (q) setPinnedQuake(q)
        else   setSelectedId(null) // invalid id — clear quietly
        setInitialResolved(true)
      })
      .catch(err => {
        // AbortError = cleanup fired; leave pending so effect can re-run if needed.
        // Any other error: unblock to avoid getting stuck forever.
        if (err.name !== 'AbortError') setInitialResolved(true)
      })

    return () => ac.abort()
  }, [loading, initialResolved, selectedId])

  // Handlers for explicit user-driven data-window changes.
  // Resetting selection here (not in a useEffect) is Strict Mode–safe and avoids the
  // isMountRef pattern, which breaks under React 18's double-invocation of effects
  // because refs persist across the deliberate unmount/remount cycle.
  function handleFilterChange(value) {
    setFilter(value)
    setSelectedId(null)
    setPinnedQuake(null)
    setNearMe(null)
    setInitialResolved(true) // explicit user action — unblock URL writes immediately
  }

  function handlePeriodChange(value) {
    setPeriod(value)
    setSelectedId(null)
    setPinnedQuake(null)
    setNearMe(null)
    setInitialResolved(true)
  }

  // Clear selection when a user-selected quake disappears from the feed after a poll.
  // Suppressed during initial resolution so the URL's q= survives the first load.
  // Pinned quakes (fetched by id, not in the current feed window) are exempt.
  useEffect(() => {
    if (!initialResolved) return
    if (selectedId === null) return
    if (pinnedQuake?.id === selectedId) return
    if (!quakes.some(q => q.id === selectedId)) setSelectedId(null)
  }, [quakes, selectedId, initialResolved, pinnedQuake])

  // Derived data
  const selectedQuake = quakes.find(q => q.id === selectedId) ?? pinnedQuake ?? null

  const quakesForDisplay = pinnedQuake && !quakes.some(q => q.id === pinnedQuake.id)
    ? [...quakes, pinnedQuake]
    : quakes

  const nearMeDistanceKm = selectedId === nearMe?.quakeId ? nearMe.distanceKm : null

  function handleNearest(quakeId, distanceKm) {
    setNearMe({ quakeId, distanceKm })
  }

  let statusText
  if (loading) {
    statusText = 'Загружаем данные…'
  } else if (error && quakes.length === 0) {
    statusText = 'Не удалось загрузить данные USGS — повторяем…'
  } else if (error) {
    statusText = `${quakes.length} ${pluralEvents(quakes.length)} · ошибка обновления`
  } else {
    statusText = `${quakes.length} ${pluralEvents(quakes.length)} · обновлено ${updatedLabel}`
  }

  return (
    <div className="app">
      <header className="app-header">
        <span className="app-wordmark mono">TREMOR</span>
        <Controls
          filter={filter}
          period={period}
          onFilterChange={handleFilterChange}
          onPeriodChange={handlePeriodChange}
          mapMode={mapMode}
          onMapModeChange={setMapMode}
        />
        <ShareButton />
      </header>
      <main className="app-main">
        <p className="app-status mono">
          <span className="live-dot" aria-hidden="true" />
          {statusText}
        </p>
        <div className="app-body">
          <WorldMap
            quakes={quakesForDisplay}
            selectedId={selectedId}
            onSelect={setSelectedId}
            mode={mapMode}
          />
          <aside className="detail-rail">
            <NearMeButton
              quakes={quakesForDisplay}
              onSelect={setSelectedId}
              onNearest={handleNearest}
            />
            <QuakeDetail quake={selectedQuake} distanceKm={nearMeDistanceKm} />
            <QuakeList
              quakes={quakesForDisplay}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </aside>
        </div>
      </main>
    </div>
  )
}
