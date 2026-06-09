import { useQuery } from '@tanstack/react-query'
import { searchVideos } from '@/lib/api'

/** 搜索影视内容（带缓存） */
export function useSearch(query: string, page = 1, siteId?: string) {
  return useQuery({
    queryKey: ['search', query, page, siteId],
    queryFn: () => searchVideos(query, page, siteId),
    enabled: query.trim().length > 0,
    staleTime: 60_000,
  })
}
