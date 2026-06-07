import { useState, useCallback } from 'react'
import type { DataSource } from '../../types/video'
import { storage } from '../../utils/storage'

interface DataSourceFormProps {
  initialData?: DataSource
  onSave: (source: DataSource) => void
  onCancel: () => void
}

/**
 * 数据源表单组件
 * 用于新增或编辑自定义数据源
 */
export function DataSourceForm({ initialData, onSave, onCancel }: DataSourceFormProps) {
  const [name, setName] = useState(initialData?.name ?? '')
  const [url, setUrl] = useState(initialData?.url ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [resolution, setResolution] = useState(initialData?.resolution ?? '')
  const [error, setError] = useState<string | null>(null)

  // 自动推断格式
  const inferFormat = useCallback((videoUrl: string): DataSource['format'] => {
    const lower = videoUrl.toLowerCase()
    if (lower.includes('.m3u8')) return 'm3u8'
    if (lower.includes('.mp4')) return 'mp4'
    if (lower.includes('.webm')) return 'webm'
    return 'other'
  }, [])

  // 自动推断分类
  const inferCategory = useCallback(
    (videoUrl: string): DataSource['category'] => {
      const fmt = inferFormat(videoUrl)
      if (fmt === 'm3u8') return 'hls'
      if (fmt === 'mp4' || fmt === 'webm') return 'mp4'
      return 'custom'
    },
    [inferFormat],
  )

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()

      // 校验
      if (!name.trim()) {
        setError('请输入名称')
        return
      }
      if (!url.trim()) {
        setError('请输入视频URL')
        return
      }
      try {
        new URL(url)
      } catch {
        setError('请输入有效的URL')
        return
      }

      const source: DataSource = {
        id: initialData?.id ?? `custom-${crypto.randomUUID()}`,
        name: name.trim(),
        url: url.trim(),
        category: inferCategory(url),
        format: inferFormat(url),
        description: description.trim() || undefined,
        resolution: resolution.trim() || undefined,
      }

      storage.addDataSource(source)
      onSave(source)
    },
    [name, url, description, resolution, initialData, inferFormat, inferCategory, onSave],
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* 名称 */}
      <div>
        <label className="block text-xs text-white/50 mb-1">名称 *</label>
        <input
          type="text"
          value={name}
          onChange={e => {
            setName(e.target.value)
            setError(null)
          }}
          placeholder="例如：Big Buck Bunny 4K"
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg
                     text-white text-sm placeholder-white/30
                     focus:outline-none focus:border-[#e94560]/50 transition-colors"
        />
      </div>

      {/* URL */}
      <div>
        <label className="block text-xs text-white/50 mb-1">视频URL *</label>
        <input
          type="url"
          value={url}
          onChange={e => {
            setUrl(e.target.value)
            setError(null)
          }}
          placeholder="https://example.com/video.mp4"
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg
                     text-white text-sm placeholder-white/30
                     focus:outline-none focus:border-[#e94560]/50 transition-colors"
        />
        {url && (
          <p className="text-xs text-white/30 mt-1">
            格式识别：{inferFormat(url).toUpperCase()} | 分类：
            {inferCategory(url) === 'hls' ? 'HLS流' : inferCategory(url) === 'mp4' ? 'MP4直接流' : '自定义'}
          </p>
        )}
      </div>

      {/* 描述 */}
      <div>
        <label className="block text-xs text-white/50 mb-1">描述（可选）</label>
        <input
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="视频简介"
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg
                     text-white text-sm placeholder-white/30
                     focus:outline-none focus:border-[#e94560]/50 transition-colors"
        />
      </div>

      {/* 分辨率 */}
      <div>
        <label className="block text-xs text-white/50 mb-1">分辨率（可选）</label>
        <input
          type="text"
          value={resolution}
          onChange={e => setResolution(e.target.value)}
          placeholder="例如：1080p, 4K"
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg
                     text-white text-sm placeholder-white/30
                     focus:outline-none focus:border-[#e94560]/50 transition-colors"
        />
      </div>

      {/* 按钮 */}
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-[#e94560] hover:bg-[#e94560]/80
                     text-white text-sm font-medium rounded-lg transition-colors"
        >
          {initialData ? '保存修改' : '添加数据源'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-white/10 hover:bg-white/15
                     text-white/70 text-sm rounded-lg transition-colors"
        >
          取消
        </button>
      </div>
    </form>
  )
}
