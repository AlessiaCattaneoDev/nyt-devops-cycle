import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react'
import type { MostPopularArticle, SectionName, TopStoryArticle } from '../types/nyt'

interface SectionState {
  articles: TopStoryArticle[]
  loading: boolean
  error: string | null
}

interface MostPopularState {
  articles: MostPopularArticle[]
  loading: boolean
  error: string | null
}

interface AppState {
  theme: 'light' | 'dark'
  sections: Partial<Record<SectionName, SectionState>>
  mostPopular: MostPopularState
}

type AppAction =
  | { type: 'TOGGLE_THEME' }
  | { type: 'SECTION_FETCH_START'; section: SectionName }
  | { type: 'SECTION_FETCH_SUCCESS'; section: SectionName; articles: TopStoryArticle[] }
  | { type: 'SECTION_FETCH_ERROR'; section: SectionName; error: string }
  | { type: 'MOST_POPULAR_FETCH_START' }
  | { type: 'MOST_POPULAR_FETCH_SUCCESS'; articles: MostPopularArticle[] }
  | { type: 'MOST_POPULAR_FETCH_ERROR'; error: string }

function getInitialTheme(): 'light' | 'dark' {
  const stored = localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark') {
    return stored
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const initialState: AppState = {
  theme: getInitialTheme(),
  sections: {},
  mostPopular: { articles: [], loading: false, error: null },
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'TOGGLE_THEME':
      return { ...state, theme: state.theme === 'dark' ? 'light' : 'dark' }
    case 'SECTION_FETCH_START':
      return {
        ...state,
        sections: {
          ...state.sections,
          [action.section]: {
            articles: state.sections[action.section]?.articles ?? [],
            loading: true,
            error: null,
          },
        },
      }
    case 'SECTION_FETCH_SUCCESS':
      return {
        ...state,
        sections: {
          ...state.sections,
          [action.section]: { articles: action.articles, loading: false, error: null },
        },
      }
    case 'SECTION_FETCH_ERROR':
      return {
        ...state,
        sections: {
          ...state.sections,
          [action.section]: {
            articles: state.sections[action.section]?.articles ?? [],
            loading: false,
            error: action.error,
          },
        },
      }
    case 'MOST_POPULAR_FETCH_START':
      return { ...state, mostPopular: { ...state.mostPopular, loading: true, error: null } }
    case 'MOST_POPULAR_FETCH_SUCCESS':
      return { ...state, mostPopular: { articles: action.articles, loading: false, error: null } }
    case 'MOST_POPULAR_FETCH_ERROR':
      return {
        ...state,
        mostPopular: { ...state.mostPopular, loading: false, error: action.error },
      }
    default:
      return state
  }
}

interface AppContextValue {
  state: AppState
  dispatch: Dispatch<AppAction>
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  useEffect(() => {
    localStorage.setItem('theme', state.theme)
    document.documentElement.classList.toggle('dark', state.theme === 'dark')
  }, [state.theme])

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}
