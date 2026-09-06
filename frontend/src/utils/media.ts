import type { Multimedia, MostPopularMedia } from '../types/nyt'

export function getArticleImageUrl(multimedia: Multimedia[] | undefined): string | null {
  if (!multimedia || multimedia.length === 0) {
    return null
  }
  const preferred = multimedia.find((item) => item.format === 'superJumbo') ?? multimedia[0]
  return preferred.url
}

export function getMostPopularImageUrl(media: MostPopularMedia[] | undefined): string | null {
  const metadata = media?.[0]?.['media-metadata']
  if (!metadata || metadata.length === 0) {
    return null
  }
  // Most Popular only ships small/medium crops (no superJumbo); the last entry is the largest.
  return metadata[metadata.length - 1].url
}
