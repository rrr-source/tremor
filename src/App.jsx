import { useState, useEffect, useRef, useMemo } from 'react'
import { readState, writeState } from './lib/urlState.js'
import { fetchQuakeById } from './lib/usgs.js'
import { makeT, makePlural, LangProvider } from './i18n/context.jsx'
import { useQuakes } from './hooks/useQuakes.js'
import { useRelativeTime } from './hooks/useRelativeTime.js'
import { useGeolocation } from './hooks/useGeolocation.js'
import { detectCountry, localizedCountryName } from './lib/countryDetect.js'
import { WorldMap } from './components/WorldMap.jsx'
import { QuakeDetail } from './components/QuakeDetail.jsx'
import { QuakeList } from './components/QuakeList.jsx'
import { Controls } from './components/Controls.jsx'
import { NearMeButton } from './components/NearMeButton.jsx'
import { ShareButton } from './components/ShareButton.jsx'
import { LangToggle } from './components/LangToggle.jsx'

// Read URL once at module load so useState gets the right initial values.
const _initial = readState()

// lang: URL param wins; otherwise detect from browser; English is the fallback.
const _initialLang = _initial.lang ?? (navigator.language?.startsWith('ru') ? 'ru' : 'en')

export default function App() {
  const [filter, setFilter]   = useState(_initial.filter)
  const [period, setPeriod]   = useState(_initial.period)
  const [mapMode, setMapMode] = useState(_initial.mode)
  const [lang, setLang]       = useState(_initialLang)

  const { quakes, loading, error, lastUpdated } = useQuakes({ filter, period })
  const { coords, loading: geoLoading, error: geoError, request: geoRequest } = useGeolocation()
  // useRelativeTime takes lang directly — it runs before the LangProvider renders.
  const updatedLabel = useRelativeTime(lastUpdated, lang)

  const [selectedId, setSelectedId]   = useState(_initial.selectedId)
  const [nearMe, setNearMe]           = useState(null)
  const [pinnedQuake, setPinnedQuake] = useState(null)

  // false while the URL's ?q= is still being validated against the feed / by-id API.
  const [initialResolved, setInitialResolved] = useState(!_initial.selectedId)

  const quakesRef = useRef([])
  useEffect(() => { quakesRef.current = quakes }, [quakes])

  // Update document lang attribute and title whenever lang changes.
  useEffect(() => {
    const t = makeT(lang)
    document.documentElement.lang = lang
    document.title = t('header.title')
  }, [lang])

  // Sync URL state on every relevant change.
  useEffect(() => {
    if (!initialResolved) return
    writeState({ mode: mapMode, period, filter, selectedId, lang })
  }, [mapMode, period, filter, selectedId, lang, initialResolved])

  // Resolve the URL's ?q= once the first feed fetch completes.
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
        else   setSelectedId(null)
        setInitialResolved(true)
      })
      .catch(err => {
        if (err.name !== 'AbortError') setInitialResolved(true)
      })

    return () => ac.abort()
  }, [loading, initialResolved, selectedId])

  function handleFilterChange(value) {
    setFilter(value)
    setSelectedId(null)
    setPinnedQuake(null)
    setNearMe(null)
    setInitialResolved(true)
  }

  function handlePeriodChange(value) {
    setPeriod(value)
    setSelectedId(null)
    setPinnedQuake(null)
    setNearMe(null)
    setInitialResolved(true)
  }

  // Clear selection when a user-selected quake disappears from the feed after a poll.
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

  // Country detection — purely offline, coords never leave this component.
  const countryFeature = useMemo(
    () => (coords ? detectCountry(coords.lon, coords.lat) : null),
    [coords]
  )
  const countryName = useMemo(
    () => localizedCountryName(countryFeature, lang),
    [countryFeature, lang]
  )

  // Status text is built here, outside LangProvider, so we use standalone helpers.
  const t      = makeT(lang)
  const plural = makePlural(lang)

  let statusText
  if (loading) {
    statusText = t('status.loading')
  } else if (error && quakes.length === 0) {
    statusText = t('status.error_no_data')
  } else if (error) {
    statusText = plural('status.events_error', quakes.length, { n: quakes.length })
  } else {
    statusText = plural('status.events_updated', quakes.length, { n: quakes.length, when: updatedLabel })
  }

  return (
    <LangProvider lang={lang} setLang={setLang}>
      <div className="app">
        <header className="app-header">
          <span className="app-wordmark mono">
            <svg className="app-wordmark-glyph" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
              <circle cx="16" cy="16" r="3"    fill="#ff5a36"/>
              <circle cx="16" cy="16" r="8.5"  fill="none" stroke="#ff5a36" strokeWidth="1.5" opacity="0.52"/>
              <circle cx="16" cy="16" r="14.5" fill="none" stroke="#ff5a36" strokeWidth="1"   opacity="0.22"/>
            </svg>
            TREMOR
          </span>
          <p className="app-status mono">
            <span className="live-dot" aria-hidden="true" />
            {statusText}
          </p>
          <Controls
            filter={filter}
            period={period}
            onFilterChange={handleFilterChange}
            onPeriodChange={handlePeriodChange}
            mapMode={mapMode}
            onMapModeChange={setMapMode}
          />
          <LangToggle />
          <ShareButton />
        </header>
        <main className="app-main">
          <div className="app-body">
            <WorldMap
              quakes={quakesForDisplay}
              selectedId={selectedId}
              onSelect={setSelectedId}
              mode={mapMode}
              userCoords={coords}
              countryFeature={countryFeature}
            />
            <aside className="detail-rail">
              <NearMeButton
                quakes={quakesForDisplay}
                onSelect={setSelectedId}
                onNearest={handleNearest}
                coords={coords}
                geoLoading={geoLoading}
                geoError={geoError}
                geoRequest={geoRequest}
                countryName={countryName}
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
    </LangProvider>
  )
}
