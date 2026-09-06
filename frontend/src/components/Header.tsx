import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Nav from './Nav'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const today = new Date().toLocaleDateString('it-IT', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  return (
    <header className="border-b border-neutral-300 dark:border-neutral-700">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <p className="text-xs text-neutral-500 dark:text-neutral-400">{today}</p>
        <ThemeToggle />
      </div>
      <div className="mx-auto max-w-6xl px-4 pb-3 text-center">
        <h1 className="font-serif text-4xl font-bold tracking-tight lg:text-6xl">
          The New York Times
        </h1>
      </div>
      <div className="mx-auto flex max-w-6xl items-center justify-between border-t border-neutral-300 px-4 py-2 dark:border-neutral-700">
        <button
          type="button"
          className="text-sm lg:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-label="Apri o chiudi il menu di navigazione"
        >
          {menuOpen ? '✕ Chiudi' : '☰ Menu'}
        </button>
        <div className={`${menuOpen ? 'block' : 'hidden'} w-full lg:block`}>
          <Nav />
        </div>
      </div>
    </header>
  )
}
