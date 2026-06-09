import { useQuery } from '@tanstack/react-query'
import { getFavorites } from '@/lib/api'

/** 获取收藏列表 */
export function useFavorites() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: () => getFavorites(),
  })
}
