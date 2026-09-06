export interface Multimedia {
  url: string
  format: string
  height: number
  width: number
  type: string
  subtype: string
  caption: string
  copyright: string
}

export interface TopStoryArticle {
  section: string
  subsection: string
  title: string
  abstract: string
  url: string
  uri: string
  byline: string
  item_type: string
  updated_date: string
  created_date: string
  published_date: string
  material_type_facet: string
  kicker: string
  des_facet: string[]
  org_facet: string[]
  per_facet: string[]
  geo_facet: string[]
  multimedia: Multimedia[]
  short_url: string
}

export interface TopStoriesResponse {
  status: string
  copyright: string
  section: string
  last_updated: string
  num_results: number
  results: TopStoryArticle[]
}

export interface MostPopularMediaMetadata {
  url: string
  format: string
  height: number
  width: number
}

export interface MostPopularMedia {
  type: string
  caption: string
  copyright: string
  approved_for_syndication: number
  'media-metadata': MostPopularMediaMetadata[]
}

export interface MostPopularArticle {
  uri: string
  url: string
  id: number
  asset_id: number
  source: string
  published_date: string
  updated: string
  section: string
  subsection: string
  byline: string
  type: string
  title: string
  abstract: string
  des_facet: string[]
  org_facet: string[]
  per_facet: string[]
  geo_facet: string[]
  media: MostPopularMedia[]
}

export interface MostPopularResponse {
  status: string
  copyright: string
  num_results: number
  results: MostPopularArticle[]
}

export type SectionName = 'home' | 'world' | 'us' | 'politics' | 'business' | 'technology' | 'arts'

export const SECTIONS: { key: SectionName; label: string }[] = [
  { key: 'home', label: 'Home' },
  { key: 'world', label: 'World' },
  { key: 'us', label: 'U.S.' },
  { key: 'politics', label: 'Politics' },
  { key: 'business', label: 'Business' },
  { key: 'technology', label: 'Technology' },
  { key: 'arts', label: 'Arts' },
]
