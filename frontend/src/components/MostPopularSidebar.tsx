import { useMostPopular } from '../hooks/useMostPopular'
import Loader from './Loader'
import ErrorBanner from './ErrorBanner'

export default function MostPopularSidebar() {
  const { articles, loading, error, refetch } = useMostPopular()

  return (
    <section className="rounded border border-neutral-300 p-4 dark:border-neutral-700">
      <h2 className="mb-3 font-serif text-lg font-bold uppercase">Più letti</h2>
      {loading && articles.length === 0 && <Loader />}
      {error && <ErrorBanner message={error} onRetry={refetch} />}
      {!loading && !error && (
        <ol className="flex flex-col gap-3">
          {articles.slice(0, 10).map((article, index) => (
            <li key={article.url} className="flex gap-3">
              <span className="font-serif text-2xl font-bold text-neutral-400">{index + 1}</span>
              <a
                href={article.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold leading-snug hover:underline"
              >
                {article.title}
              </a>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
