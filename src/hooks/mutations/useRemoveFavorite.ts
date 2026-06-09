import { useMutation, useQueryClient } from '@tanstack/react-query'
import { removeFavorite } from '@/lib/api'

/** 删除收藏 */
export function useRemoveFavorite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (url: string) => removeFavorite(url),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['favorites'] }),
  })
}
