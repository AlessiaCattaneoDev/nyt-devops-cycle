import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
      <h1 className="font-serif text-4xl font-bold">404</h1>
      <p>Pagina non trovata.</p>
      <Link to="/" className="underline">
        Torna alla home
      </Link>
    </div>
  )
}
