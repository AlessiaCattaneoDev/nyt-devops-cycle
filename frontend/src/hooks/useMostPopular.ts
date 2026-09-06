import { useCallback, useEffect, useRef } from 'react'
import { useAppContext } from '../context/AppContext'
import { fetchMostPopular } from '../api/mostPopular'

export function useMostPopular() {
  const { state, dispatch } = useAppContext()
  const { articles, loading, error } = state.mostPopular
  const hasLoaded = articles.length > 0
  const hasRequested = useRef(false)

  const load = useCallback(async () => {
    dispatch({ type: 'MOST_POPULAR_FETCH_START' })
    try {
      const data = await fetchMostPopular()
      dispatch({ type: 'MOST_POPULAR_FETCH_SUCCESS', articles: data.results })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore nel caricamento dei più letti.'
      dispatch({ type: 'MOST_POPULAR_FETCH_ERROR', error: message })
    }
  }, [dispatch])

  useEffect(() => {
    if (!hasLoaded && !hasRequested.current) {
      hasRequested.current = true
      load()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { articles, loading, error, refetch: load }
}
