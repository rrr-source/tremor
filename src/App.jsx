import { useState, useEffect } from 'react'
import { useQuakes } from './hooks/useQuakes.js'
import { useRelativeTime } from './hooks/useRelativeTime.js'
import { WorldMap } from './components/WorldMap.jsx'
import { QuakeDetail } from './components/QuakeDetail.jsx'
import { QuakeList } from './components/QuakeList.jsx'
import { Controls } from './components/Controls.jsx'

export default function App() {
  const [filter, setFilter] = useState('2.5')
  const [period, setPeriod] = useState('day')

  const { quakes, loading, error, lastUpdated } = useQuakes({ filter, period })
  const updatedLabel = useRelativeTime(lastUpdated)
  const [selectedId, setSelectedId] = useState(null)

  // Clear selection when the selected quake leaves the current result set.
  useEffect(() => {
    if (selectedId !== null && !quakes.some(q => q.id === selectedId)) {
      setSelectedId(null)
    }
  }, [quakes, selectedId])

  const selectedQuake = quakes.find(q => q.id === selectedId) ?? null

  let statusText
  if (loading) {
    statusText = 'Загружаем данные…'
  } else if (error && quakes.length === 0) {
    statusText = 'Не удалось загрузить данные USGS — повторяем…'
  } else if (error) {
    statusText = `${quakes.length} событий · ошибка обновления`
  } else {
    statusText = `${quakes.length} событий · обновлено ${updatedLabel}`
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
          />
          <aside className="detail-rail">
            <QuakeDetail quake={selectedQuake} />
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
