import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchQuakes } from '../lib/usgs.js'

export function useQuakes({ filter = '2.5', period = 'day' } = {}) {
  const [quakes, setQuakes]           = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  // Incremented to trigger a manual reload without changing filter/period.
  const [rev, setRev] = useState(0)
  const reload = useCallback(() => setRev(r => r + 1), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchQuakes(filter, period)
      .then(data => {
        if (cancelled) return
        setQuakes(data)
        setLastUpdated(Date.now())
        setLoading(false)
      })
      .catch(err => {
        if (cancelled) return
        setError(err.message)
        setLoading(false)
      })

    return () => { cancelled = true }
  }, [filter, period, rev])

  return { quakes, loading, error, lastUpdated, reload }
}
