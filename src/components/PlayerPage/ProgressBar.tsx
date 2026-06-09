import { forwardRef, type PointerEvent } from 'react'

interface ProgressBarProps {
  /** 正常播放进度 0-100 */
  progress: number
  /** 缓冲进度 0-100 */
  buffered: number
  duration: number
  isDragging: boolean
  /** 拖拽时进度 0-100 */
  dragProgress: number
  /** 拖拽时时间（秒） */
  dragTime: number
  onPointerDown: (e: PointerEvent<HTMLDivElement>) => void
  formatTime: (s: number) => string
}

/** 格式化时间辅助函数在外部已存在，此处通过 props 传入 */

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  function ProgressBar(
    { progress, buffered, duration, isDragging, dragProgress, dragTime, onPointerDown, formatTime },
    ref,
  ) {
    const displayProgress = isDragging ? dragProgress : progress
    const displayTime = isDragging ? dragTime : 0

    return (
      <div
        ref={ref}
        className="w-full h-1 hover:h-1.5 bg-white/20 rounded-full cursor-pointer relative group mb-4 transition-all"
        onPointerDown={onPointerDown}
      >
        {/* 缓冲进度 - 浅灰 */}
        <div
          className="absolute top-0 left-0 h-full bg-white/20 rounded-full"
          style={{ width: `${buffered}%` }}
        />

        {/* 播放进度 - 红色 */}
        <div
          className="absolute top-0 left-0 h-full bg-[#ff0000] rounded-full transition-[width] duration-75"
          style={{ width: `${displayProgress}%` }}
        />

        {/* 播放头 */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-[#ff0000] rounded-full shadow-lg
            ${isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}
          style={{ left: `calc(${displayProgress}% - 7px)` }}
        />

        {/* 拖拽时时间提示 */}
        {isDragging && (
          <div
            className="absolute -top-8 -translate-x-1/2 bg-black/80 rounded-lg px-2 py-1 text-white text-xs
                       whitespace-nowrap pointer-events-none select-none"
            style={{ left: `${displayProgress}%` }}
          >
            {formatTime(displayTime)} / {formatTime(duration)}
          </div>
        )}
      </div>
    )
  },
)
