import { NavLink } from 'react-router-dom'
import { SECTIONS } from '../types/nyt'

export default function Nav() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm uppercase tracking-wide hover:underline ${isActive ? 'font-bold underline' : 'font-normal'}`

  return (
    <nav className="flex flex-col gap-4 lg:flex-row lg:items-center">
      {SECTIONS.map((s) =>
        s.key === 'home' ? (
          <NavLink key={s.key} to="/" end className={linkClass}>
            {s.label}
          </NavLink>
        ) : (
          <NavLink key={s.key} to={`/section/${s.key}`} className={linkClass}>
            {s.label}
          </NavLink>
        ),
      )}
    </nav>
  )
}
