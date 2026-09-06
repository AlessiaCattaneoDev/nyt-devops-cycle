import { nytClient } from './client'
import type { MostPopularResponse } from '../types/nyt'

export async function fetchMostPopular(days: 1 | 7 | 30 = 7): Promise<MostPopularResponse> {
  const response = await nytClient.get<MostPopularResponse>('/mostpopular', {
    params: { days },
  })
  return response.data
}
