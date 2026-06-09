import { useQuery } from '@tanstack/react-query'
import { getHistory } from '@/lib/api'

/** 获取观看历史 */
export function useHistory() {
  return useQuery({
    queryKey: ['history'],
    queryFn: () => getHistory(),
  })
}
