import { useArticleNavigation } from '../hooks/useArticleNavigation'
import { getArticleImageUrl } from '../utils/media'
import type { SectionName, TopStoryArticle } from '../types/nyt'

interface ArticleCardProps {
  article: TopStoryArticle
  section: SectionName
}

export default function ArticleCard({ article, section }: ArticleCardProps) {
  const { handleClick, handleKeyDown } = useArticleNavigation(article, section)
  const imageUrl = getArticleImageUrl(article.multimedia)

  return (
    <article
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      className="cursor-pointer border-b border-neutral-200 pb-4 dark:border-neutral-800"
    >
      {imageUrl && (
        <img src={imageUrl} alt={article.title} className="mb-2 aspect-video w-full object-cover" />
      )}
      <h3 className="font-serif text-lg font-bold leading-snug">{article.title}</h3>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{article.abstract}</p>
      {article.byline && (
        <p className="mt-1 text-xs uppercase text-neutral-500">{article.byline}</p>
      )}
    </article>
  )
}
