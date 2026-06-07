import { useState, useCallback } from 'react'
import type { Theme } from '../../types/video'

interface DropZoneProps {
  theme: Theme
  onFileSelect: (file: File) => void
}

export function DropZone({ theme, onFileSelect }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [dragError, setDragError] = useState<string | null>(null)
  const isDark = theme === 'dark'

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
    setDragError(null)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    if (files.length === 0) return

    const file = files[0]
    if (!file || !isVideoFile(file)) {
      setDragError('不支持的文件格式，请拖入视频文件 (.mp4, .webm, .ogg)')
      return
    }

    setDragError(null)
    onFileSelect(file)
  }, [onFileSelect])

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer
        ${isDragOver
          ? 'border-[#e94560] bg-[#e94560]/5'
          : isDark
            ? 'border-white/10 hover:border-white/25 bg-white/[0.02]'
            : 'border-gray-200 hover:border-gray-300 bg-gray-50'
        }
        ${dragError ? 'border-red-500/50' : ''}`}
    >
      <div className="text-4xl mb-3">
        {isDragOver ? '📥' : '🎬'}
      </div>
      <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
        {isDragOver
          ? '释放文件以播放'
          : '拖拽视频文件到这里，或使用下方 URL 输入'
        }
      </p>
      <p className={`text-xs mt-1 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
        支持格式: .mp4, .webm, .ogg, .mov
      </p>
      {dragError && (
        <p className="text-red-400 text-sm mt-2">{dragError}</p>
      )}
    </div>
  )
}

/** 允许的视频MIME类型 */
const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
]

/** 验证文件是否是视频类型 */
function isVideoFile(file: File): boolean {
  if (ALLOWED_VIDEO_TYPES.includes(file.type)) {
    return true
  }
  const name = file.name.toLowerCase()
  return ['.mp4', '.webm', '.ogg', '.mov'].some(ext => name.endsWith(ext))
}
