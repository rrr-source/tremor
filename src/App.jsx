import { useState } from 'react'
import { useQuakes } from './hooks/useQuakes.js'
import { useRelativeTime } from './hooks/useRelativeTime.js'
import { WorldMap } from './components/WorldMap.jsx'
import { QuakeDetail } from './components/QuakeDetail.jsx'

export default function App() {
  const { quakes, loading, error, lastUpdated } = useQuakes({ filter: '2.5', period: 'day' })
  const updatedLabel = useRelativeTime(lastUpdated)
  const [selectedId, setSelectedId] = useState(null)

  const selectedQuake = quakes.find(q => q.id === selectedId) ?? null

  let statusText
  if (loading) {
    statusText = 'Загрузка данных…'
  } else if (error) {
    statusText = `Ошибка: ${error}`
  } else {
    statusText = `${quakes.length} событий · обновлено ${updatedLabel}`
  }

  return (
    <div className="app">
      <header className="app-header">
        <span className="app-wordmark mono">TREMOR</span>
      </header>
      <main className="app-main">
        <p className="app-status mono">{statusText}</p>
        <div className="app-body">
          <WorldMap
            quakes={quakes}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
          <aside className="detail-rail">
            <QuakeDetail quake={selectedQuake} />
          </aside>
        </div>
      </main>
    </div>
  )
}
