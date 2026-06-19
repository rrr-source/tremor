import { useEffect, useState } from 'react'
import { useQuakes } from './hooks/useQuakes.js'
import { WorldMap } from './components/WorldMap.jsx'

function useRelativeTime(timestamp) {
  const [label, setLabel] = useState('')

  useEffect(() => {
    if (!timestamp) return

    function update() {
      const secs = Math.floor((Date.now() - timestamp) / 1000)
      if (secs < 60) {
        setLabel(`${secs} сек назад`)
      } else {
        setLabel(`${Math.floor(secs / 60)} мин назад`)
      }
    }

    update()
    const id = setInterval(update, 10_000)
    return () => clearInterval(id)
  }, [timestamp])

  return label
}

export default function App() {
  const { quakes, loading, error, lastUpdated } = useQuakes({ filter: '2.5', period: 'day' })
  const updatedLabel = useRelativeTime(lastUpdated)
  const [selectedId, setSelectedId] = useState(null)

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
        <WorldMap
          quakes={quakes}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </main>
    </div>
  )
}
