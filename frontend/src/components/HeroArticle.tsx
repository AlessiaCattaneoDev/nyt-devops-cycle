import { useArticleNavigation } from '../hooks/useArticleNavigation'
import { getArticleImageUrl } from '../utils/media'
import type { SectionName, TopStoryArticle } from '../types/nyt'

interface HeroArticleProps {
  article: TopStoryArticle
  section: SectionName
}

export default function HeroArticle({ article, section }: HeroArticleProps) {
  const { handleClick, handleKeyDown } = useArticleNavigation(article, section)
  const imageUrl = getArticleImageUrl(article.multimedia)

  return (
    <article
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      className="mb-8 cursor-pointer border-b border-neutral-300 pb-6 dark:border-neutral-700"
    >
      {imageUrl && (
        <img src={imageUrl} alt={article.title} className="mb-4 aspect-video w-full object-cover" />
      )}
      <h2 className="font-serif text-3xl font-bold leading-tight lg:text-4xl">{article.title}</h2>
      <p className="mt-2 text-base text-neutral-700 dark:text-neutral-300">{article.abstract}</p>
      {article.byline && (
        <p className="mt-2 text-xs uppercase text-neutral-500">{article.byline}</p>
      )}
    </article>
  )
}
