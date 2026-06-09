import { useMutation } from '@tanstack/react-query'
import { updateHistory } from '@/lib/api'

/** 更新观看记录 */
export function useUpdateHistory() {
  return useMutation({
    mutationFn: updateHistory,
  })
}
