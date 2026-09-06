import { nytClient } from './client'
import type { SectionName, TopStoriesResponse } from '../types/nyt'

export async function fetchTopStories(section: SectionName): Promise<TopStoriesResponse> {
  const response = await nytClient.get<TopStoriesResponse>(`/topstories/${section}`)
  return response.data
}
