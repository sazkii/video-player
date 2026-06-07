import { useState, useCallback } from 'react'
import type { Theme, DataSource } from '../../types/video'
import { storage } from '../../utils/storage'

interface DataSourceFormProps {
  initialData?: DataSource
  onSave: (source: DataSource) => void
  onCancel: () => void
  theme: Theme
}

export function DataSourceForm({ initialData, onSave, onCancel, theme }: DataSourceFormProps) {
  const [name, setName] = useState(initialData?.name ?? '')
  const [url, setUrl] = useState(initialData?.url ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [resolution, setResolution] = useState(initialData?.resolution ?? '')
  const [error, setError] = useState<string | null>(null)
  const isDark = theme === 'dark'

  const inferFormat = useCallback((videoUrl: string): DataSource['format'] => {
    const lower = videoUrl.toLowerCase()
    if (lower.includes('.m3u8')) return 'm3u8'
    if (lower.includes('.mp4')) return 'mp4'
    if (lower.includes('.webm')) return 'webm'
    return 'other'
  }, [])

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

      if (!name.trim()) { setError('请输入名称'); return }
      if (!url.trim()) { setError('请输入视频URL'); return }
      try { new URL(url) } catch { setError('请输入有效的URL'); return }

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

  const inputClass = `w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-colors
    ${isDark
      ? 'bg-white/[0.04] text-white placeholder-white/25 focus:bg-white/[0.07]'
      : 'bg-gray-100 text-gray-900 placeholder-gray-400 focus:bg-gray-50'
    }`

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="px-3 py-2 bg-red-500/10 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className={`block text-[11px] mb-1.5 font-medium ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
          名称 *
        </label>
        <input type="text" value={name} onChange={e => { setName(e.target.value); setError(null) }}
          placeholder="例如：Big Buck Bunny 4K" className={inputClass} />
      </div>

      <div>
        <label className={`block text-[11px] mb-1.5 font-medium ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
          视频 URL *
        </label>
        <input type="url" value={url} onChange={e => { setUrl(e.target.value); setError(null) }}
          placeholder="https://example.com/video.mp4" className={inputClass} />
        {url && (
          <p className={`text-[11px] mt-1.5 ${isDark ? 'text-white/22' : 'text-gray-400'}`}>
            格式：{inferFormat(url).toUpperCase()} | 分类：
            {inferCategory(url) === 'hls' ? 'HLS 流' : inferCategory(url) === 'mp4' ? '直接流' : '自定义'}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={`block text-[11px] mb-1.5 font-medium ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
            描述
          </label>
          <input type="text" value={description} onChange={e => setDescription(e.target.value)}
            placeholder="可选" className={inputClass} />
        </div>
        <div>
          <label className={`block text-[11px] mb-1.5 font-medium ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
            分辨率
          </label>
          <input type="text" value={resolution} onChange={e => setResolution(e.target.value)}
            placeholder="1080p" className={inputClass} />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button type="submit"
          className="flex-1 py-2.5 bg-[#e94560] hover:bg-[#e94560]/85
                     text-white text-sm font-medium rounded-xl transition-colors">
          {initialData ? '保存' : '添加'}
        </button>
        <button type="button" onClick={onCancel}
          className={`px-4 py-2.5 text-sm rounded-xl transition-colors
            ${isDark ? 'bg-white/[0.05] hover:bg-white/[0.08] text-white/60' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}>
          取消
        </button>
      </div>
    </form>
  )
}
