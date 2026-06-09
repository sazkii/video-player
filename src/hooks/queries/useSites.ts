import { useQuery } from '@tanstack/react-query'
import { getSites } from '@/lib/api'

/** 获取站点列表 */
export function useSites() {
  return useQuery({
    queryKey: ['sites'],
    queryFn: () => getSites(),
  })
}
