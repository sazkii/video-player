import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addFavorite } from '@/lib/api'

/** 添加收藏 */
export function useAddFavorite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: addFavorite,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['favorites'] }),
  })
}
