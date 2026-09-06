import ArticleCard from './ArticleCard'
import type { SectionName, TopStoryArticle } from '../types/nyt'

interface ArticleGridProps {
  articles: TopStoryArticle[]
  section: SectionName
}

export default function ArticleGrid({ articles, section }: ArticleGridProps) {
  if (articles.length === 0) {
    return <p className="text-sm text-neutral-500">Nessun articolo disponibile.</p>
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {articles.map((article) => (
        <ArticleCard key={article.url} article={article} section={section} />
      ))}
    </div>
  )
}
