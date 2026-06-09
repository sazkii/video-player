import { useQuery } from '@tanstack/react-query'
import { getDetail } from '@/lib/api'

/** 获取视频详情 */
export function useDetail(url: string, siteId: string) {
  return useQuery({
    queryKey: ['detail', url, siteId],
    queryFn: () => getDetail(url, siteId),
    enabled: !!url && !!siteId,
  })
}
