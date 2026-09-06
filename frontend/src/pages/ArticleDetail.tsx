import { useEffect, useMemo, useState } from 'react'
import { useLocation, useParams, useSearchParams, Link } from 'react-router-dom'
import { useSection } from '../hooks/useSection'
import { useMostPopular } from '../hooks/useMostPopular'
import { getArticleImageUrl, getMostPopularImageUrl } from '../utils/media'
import Loader from '../components/Loader'
import ErrorBanner from '../components/ErrorBanner'
import { SECTIONS } from '../types/nyt'
import type { MostPopularArticle, SectionName, TopStoryArticle } from '../types/nyt'

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const stateArticle = (location.state as { article?: TopStoryArticle } | null)?.article

  const sectionParam = searchParams.get('section')
  const fallbackSection: SectionName = SECTIONS.some((s) => s.key === sectionParam)
    ? (sectionParam as SectionName)
    : 'home'

  const {
    articles: sectionArticles,
    loading: sectionLoading,
    error: sectionError,
    refetch: refetchSection,
  } = useSection(fallbackSection)
  const {
    articles: popularArticles,
    loading: popularLoading,
    error: popularError,
    refetch: refetchPopular,
  } = useMostPopular()

  const [article, setArticle] = useState<TopStoryArticle | null>(stateArticle ?? null)
  const [popularArticle, setPopularArticle] = useState<MostPopularArticle | null>(null)

  // The id is `encodeURIComponent(article.url)`. Decoded, it's the original nytimes.com
  // URL, which we can offer as a direct link even if the article data itself is gone.
  const decodedUrl = useMemo(() => {
    if (!id) return null
    try {
      return decodeURIComponent(id)
    } catch {
      return null
    }
  }, [id])

  useEffect(() => {
    if (!article && !popularArticle && id) {
      const foundInSection = sectionArticles.find(
        (a) => encodeURIComponent(a.url) === id || a.url === decodedUrl,
      )
      if (foundInSection) {
        setArticle(foundInSection)
        return
      }
      const foundInPopular = popularArticles.find(
        (a) => encodeURIComponent(a.url) === id || a.url === decodedUrl,
      )
      if (foundInPopular) {
        setPopularArticle(foundInPopular)
      }
    }
  }, [article, popularArticle, sectionArticles, popularArticles, id, decodedUrl])

  const stillLoading = !article && !popularArticle && (sectionLoading || popularLoading)
  const bothErrored = !article && !popularArticle && !stillLoading && (sectionError || popularError)

  if (stillLoading) {
    return <Loader />
  }

  if (bothErrored) {
    return (
      <ErrorBanner
        message={sectionError ?? popularError ?? "Errore nel caricamento dell'articolo."}
        onRetry={() => {
          refetchSection()
          refetchPopular()
        }}
      />
    )
  }

  if (!article && !popularArticle) {
    // Top Stories and Most Popular are both live snapshots, not an archive: once an
    // article rotates out of them there's no API to fetch it back by URL. Say so
    // honestly instead of showing a generic "not found".
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
        <p>
          Questo articolo non è più tra gli articoli in evidenza (le liste Top Stories e Più letti
          cambiano nel tempo, e non sono un archivio consultabile per URL).
        </p>
        {decodedUrl && (
          <a href={decodedUrl} target="_blank" rel="noreferrer" className="underline">
            Leggilo direttamente su nytimes.com →
          </a>
        )}
        <Link to="/" className="underline">
          Torna alla home
        </Link>
      </div>
    )
  }

  const display = article
    ? {
        section: article.section,
        title: article.title,
        byline: article.byline,
        abstract: article.abstract,
        url: article.url,
        imageUrl: getArticleImageUrl(article.multimedia),
      }
    : {
        section: popularArticle!.section,
        title: popularArticle!.title,
        byline: popularArticle!.byline,
        abstract: popularArticle!.abstract,
        url: popularArticle!.url,
        imageUrl: getMostPopularImageUrl(popularArticle!.media),
      }

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-xs uppercase text-neutral-500">{display.section}</p>
      <h1 className="mt-2 font-serif text-3xl font-bold leading-tight lg:text-5xl">
        {display.title}
      </h1>
      {display.byline && (
        <p className="mt-3 text-sm uppercase text-neutral-500">{display.byline}</p>
      )}
      {display.imageUrl && (
        <img src={display.imageUrl} alt={display.title} className="my-6 w-full object-cover" />
      )}
      <p className="text-lg leading-relaxed text-neutral-800 dark:text-neutral-200">
        {display.abstract}
      </p>
      <a
        href={display.url}
        target="_blank"
        rel="noreferrer"
        className="mt-8 inline-block underline"
      >
        Leggi l'articolo completo su nytimes.com →
      </a>
    </article>
  )
}
