import { useState, useEffect, useCallback } from 'react'
import { fetchQuakes } from '../lib/usgs.js'

const POLL_MS = 60_000

export function useQuakes({ filter = '2.5', period = 'day' } = {}) {
  const [quakes, setQuakes]           = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const [rev, setRev] = useState(0)
  const reload = useCallback(() => setRev(r => r + 1), [])

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    // initial=true → shows loading state, clears error; used for first fetch & manual reload.
    // initial=false → silent poll: updates data in place, never clears quakes or flips loading.
    async function doFetch(initial) {
      if (initial) {
        setLoading(true)
        setError(null)
      }
      try {
        const data = await fetchQuakes(filter, period, { signal })
        setQuakes(data)
        setLastUpdated(Date.now())
        setError(null)
        setLoading(false)
      } catch (err) {
        if (err.name === 'AbortError') return
        setError(err.message)
        if (initial) setLoading(false)
      }
    }

    doFetch(true)
    const pollId = setInterval(() => doFetch(false), POLL_MS)

    return () => {
      controller.abort()
      clearInterval(pollId)
    }
  }, [filter, period, rev])

  return { quakes, loading, error, lastUpdated, reload }
}
