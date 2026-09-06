import { useNavigate } from 'react-router-dom'
import type { SectionName, TopStoryArticle } from '../types/nyt'

export function useArticleNavigation(article: TopStoryArticle, section: SectionName) {
  const navigate = useNavigate()

  function handleClick() {
    const id = encodeURIComponent(article.url)
    navigate(`/article/${id}?section=${section}`, { state: { article } })
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleClick()
    }
  }

  return { handleClick, handleKeyDown }
}
