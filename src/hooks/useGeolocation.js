import { useState, useCallback } from 'react'

export function useGeolocation() {
  const [coords, setCoords] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const request = useCallback(() => {
    if (!navigator.geolocation) {
      setError('unavailable')
      return
    }
    setLoading(true)
    setError(null)
    setCoords(null)
    navigator.geolocation.getCurrentPosition(
      pos => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude })
        setLoading(false)
      },
      err => {
        setError(err.code === 1 ? 'denied' : 'unavailable')
        setLoading(false)
      },
      { timeout: 10000 },
    )
  }, [])

  return { coords, loading, error, request }
}
