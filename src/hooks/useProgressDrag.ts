import { useState, useRef, useEffect, useCallback, type RefObject } from 'react'

interface UseProgressDragOptions {
  progressRef: RefObject<HTMLDivElement | null>
  duration: number
  onSeek: (time: number) => void
  onDragStart?: () => void
  onDragEnd?: () => void
}

interface UseProgressDragReturn {
  isDragging: boolean
  /** 拖拽时的进度百分比 0-100 */
  dragProgress: number
  /** 拖拽时的时间（秒） */
  dragTime: number
  handlePointerDown: (e: React.PointerEvent) => void
}

/**
 * 进度条拖拽 hook —— 支持鼠标和触控
 * 使用 PointerEvent 统一处理，setPointerCapture 保证拖出区域仍能追踪
 */
export function useProgressDrag({
  progressRef,
  duration,
  onSeek,
  onDragStart,
  onDragEnd,
}: UseProgressDragOptions): UseProgressDragReturn {
  const [isDragging, setIsDragging] = useState(false)
  const [dragProgress, setDragProgress] = useState(0)
  const [dragTime, setDragTime] = useState(0)

  const isDraggingRef = useRef(false)
  const pointerIdRef = useRef(0)

  /** 从指针位置计算进度 0-1 */
  const calcProgress = useCallback((clientX: number): number => {
    const bar = progressRef.current
    if (!bar || !duration) return 0
    const rect = bar.getBoundingClientRect()
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
  }, [progressRef, duration])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!duration) return
    e.preventDefault()
    e.stopPropagation()

    const bar = progressRef.current
    if (!bar) return

    // 捕获指针，保证拖出区域仍能追踪
    bar.setPointerCapture(e.pointerId)
    pointerIdRef.current = e.pointerId

    const ratio = calcProgress(e.clientX)
    isDraggingRef.current = true
    setIsDragging(true)
    setDragProgress(ratio * 100)
    setDragTime(ratio * duration)
    onDragStart?.()
  }, [calcProgress, duration, onDragStart, progressRef])

  // 注册全局 pointermove / pointerup（仅拖拽时）
  useEffect(() => {
    if (!isDragging) return

    const onMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return
      const ratio = calcProgress(e.clientX)
      setDragProgress(ratio * 100)
      setDragTime(ratio * duration)
    }

    const onUp = (e: PointerEvent) => {
      if (!isDraggingRef.current) return
      isDraggingRef.current = false
      setIsDragging(false)
      const ratio = calcProgress(e.clientX)
      onSeek(ratio * duration)
      onDragEnd?.()
    }

    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup', onUp)
    return () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
    }
  }, [isDragging, calcProgress, duration, onSeek, onDragEnd])

  return { isDragging, dragProgress, dragTime, handlePointerDown }
}
