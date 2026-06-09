import { useQuery } from '@tanstack/react-query'
import { getPlaySources } from '@/lib/api'

/** 获取播放源 */
export function usePlaySources(url: string, siteId: string, episodeUrl?: string, sourceGroup?: string) {
  return useQuery({
    queryKey: ['sources', url, siteId, episodeUrl, sourceGroup],
    queryFn: () => getPlaySources(url, siteId, episodeUrl, sourceGroup),
    enabled: !!url && !!siteId,
  })
}
