import { useSection } from '../hooks/useSection'
import HeroArticle from '../components/HeroArticle'
import ArticleGrid from '../components/ArticleGrid'
import MostPopularSidebar from '../components/MostPopularSidebar'
import Loader from '../components/Loader'
import ErrorBanner from '../components/ErrorBanner'
import type { SectionName } from '../types/nyt'

interface SectionViewProps {
  section: SectionName
}

export default function SectionView({ section }: SectionViewProps) {
  const { articles, loading, error, refetch } = useSection(section)

  if (loading && articles.length === 0) {
    return <Loader />
  }

  if (error) {
    return <ErrorBanner message={error} onRetry={refetch} />
  }

  const [hero, ...rest] = articles

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 lg:flex-row">
      <div className="flex-1">
        {hero && <HeroArticle article={hero} section={section} />}
        <ArticleGrid articles={rest} section={section} />
      </div>
      <aside className="w-full lg:w-80">
        <MostPopularSidebar />
      </aside>
    </div>
  )
}
