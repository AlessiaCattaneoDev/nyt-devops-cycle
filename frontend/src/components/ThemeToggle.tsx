import { useAppContext } from '../context/AppContext'

export default function ThemeToggle() {
  const { state, dispatch } = useAppContext()

  return (
    <button
      type="button"
      onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
      aria-label="Cambia tema chiaro/scuro"
      className="rounded border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-700"
    >
      {state.theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
    </button>
  )
}
