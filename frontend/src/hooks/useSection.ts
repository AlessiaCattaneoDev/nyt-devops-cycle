import { useCallback, useEffect, useRef } from 'react'
import { useAppContext } from '../context/AppContext'
import { fetchTopStories } from '../api/topStories'
import type { SectionName } from '../types/nyt'

export function useSection(section: SectionName) {
  const { state, dispatch } = useAppContext()
  const sectionState = state.sections[section]
  const requestedSections = useRef(new Set<SectionName>())

  const load = useCallback(async () => {
    dispatch({ type: 'SECTION_FETCH_START', section })
    try {
      const data = await fetchTopStories(section)
      dispatch({ type: 'SECTION_FETCH_SUCCESS', section, articles: data.results })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore nel caricamento degli articoli.'
      dispatch({ type: 'SECTION_FETCH_ERROR', section, error: message })
    }
  }, [dispatch, section])

  useEffect(() => {
    if (!sectionState && !requestedSections.current.has(section)) {
      requestedSections.current.add(section)
      load()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section])

  return {
    articles: sectionState?.articles ?? [],
    loading: sectionState?.loading ?? true,
    error: sectionState?.error ?? null,
    refetch: load,
  }
}
