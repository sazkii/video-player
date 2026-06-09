import { useRef, useCallback } from 'react'

interface GestureCallbacks {
  onDoubleTapLeft: () => void
  onDoubleTapRight: () => void
  onSwipeUpLeft: (delta: number) => void  // 左侧上滑：亮度（预留）
  onSwipeDownLeft: (delta: number) => void
  onSwipeUpRight: (delta: number) => void  // 右侧上滑：音量
  onSwipeDownRight: (delta: number) => void
}

interface TouchPoint {
  x: number
  y: number
  time: number
}

/** 移动手势控制 Hook — 双击快进快退 + 左右滑动调节 */
export function useGestureControls(callbacks: GestureCallbacks) {
  const lastTapRef = useRef<TouchPoint | null>(null)
  const touchStartRef = useRef<TouchPoint | null>(null)
  const isDraggingRef = useRef(false)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    if (!touch) return
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() }
    isDraggingRef.current = false
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const start = touchStartRef.current
    const touch = e.touches[0]
    if (!start || !touch) return

    const dy = start.y - touch.clientY
    if (Math.abs(dy) > 30) {
      isDraggingRef.current = true
    }
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const start = touchStartRef.current
    const touch = e.changedTouches[0]
    if (!start || !touch) return

    const dx = touch.clientX - start.x
    const dy = start.y - touch.clientY
    const elapsed = Date.now() - start.time
    const isLeftSide = start.x < window.innerWidth / 2

    // 双击检测（300ms内两次点击，位移小于20px）
    if (Math.abs(dx) < 20 && Math.abs(dy) < 20 && elapsed < 300) {
      const last = lastTapRef.current
      if (last && Date.now() - last.time < 300 && Math.abs(last.x - start.x) < 50) {
        if (isLeftSide) {
          callbacks.onDoubleTapLeft()
        } else {
          callbacks.onDoubleTapRight()
        }
        lastTapRef.current = null
        return
      }
      lastTapRef.current = { x: start.x, y: start.y, time: Date.now() }
      return
    }

    // 垂直滑动
    if (isDraggingRef.current && Math.abs(dy) > 40) {
      const delta = dy / window.innerHeight
      if (isLeftSide) {
        if (dy > 0) callbacks.onSwipeUpLeft(delta)
        else callbacks.onSwipeDownLeft(delta)
      } else {
        if (dy > 0) callbacks.onSwipeUpRight(delta)
        else callbacks.onSwipeDownRight(delta)
      }
    }

    touchStartRef.current = null
    isDraggingRef.current = false
  }, [callbacks])

  return { handleTouchStart, handleTouchMove, handleTouchEnd }
}
