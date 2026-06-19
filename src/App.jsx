import { useState, useEffect } from 'react'
import { useQuakes } from './hooks/useQuakes.js'
import { useRelativeTime } from './hooks/useRelativeTime.js'
import { WorldMap } from './components/WorldMap.jsx'
import { QuakeDetail } from './components/QuakeDetail.jsx'
import { QuakeList } from './components/QuakeList.jsx'
import { Controls } from './components/Controls.jsx'
import { NearMeButton } from './components/NearMeButton.jsx'

function pluralEvents(n) {
  const last2 = n % 100
  const last1 = n % 10
  if (last2 >= 11 && last2 <= 19) return 'событий'
  if (last1 === 1)                 return 'событие'
  if (last1 >= 2 && last1 <= 4)   return 'события'
  return 'событий'
}

export default function App() {
  const [filter, setFilter] = useState('2.5')
  const [period, setPeriod] = useState('day')

  const { quakes, loading, error, lastUpdated } = useQuakes({ filter, period })
  const updatedLabel = useRelativeTime(lastUpdated)
  const [selectedId, setSelectedId] = useState(null)
  const [nearMe, setNearMe] = useState(null)
  const [mapMode, setMapMode] = useState('globe')

  // Clear selection when the selected quake leaves the current result set.
  useEffect(() => {
    if (selectedId !== null && !quakes.some(q => q.id === selectedId)) {
      setSelectedId(null)
    }
  }, [quakes, selectedId])

  // Clear nearMe when that quake leaves the result set.
  useEffect(() => {
    if (nearMe !== null && !quakes.some(q => q.id === nearMe.quakeId)) {
      setNearMe(null)
    }
  }, [quakes, nearMe])

  const selectedQuake = quakes.find(q => q.id === selectedId) ?? null
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
          onFilterChange={setFilter}
          onPeriodChange={setPeriod}
          mapMode={mapMode}
          onMapModeChange={setMapMode}
        />
      </header>
      <main className="app-main">
        <p className="app-status mono">
          <span className="live-dot" aria-hidden="true" />
          {statusText}
        </p>
        <div className="app-body">
          <WorldMap
            quakes={quakes}
            selectedId={selectedId}
            onSelect={setSelectedId}
            mode={mapMode}
          />
          <aside className="detail-rail">
            <NearMeButton
              quakes={quakes}
              onSelect={setSelectedId}
              onNearest={handleNearest}
            />
            <QuakeDetail quake={selectedQuake} distanceKm={nearMeDistanceKm} />
            <QuakeList
              quakes={quakes}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </aside>
        </div>
      </main>
    </div>
  )
}
