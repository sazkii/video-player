import { useState, useCallback } from 'react'
import { validateVideoURL } from '../../utils/validateURL'
import { storage } from '../../utils/storage'

interface URLInputProps {
  onSubmit: (url: string) => void
}

export function URLInput({ onSubmit }: URLInputProps) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)

  const history = storage.getURLHistory()

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    const result = validateVideoURL(url)
    if (!result.valid) {
      setError(result.error ?? '无效的URL')
      return
    }
    setError(null)
    storage.addURLToHistory(url)
    onSubmit(url)
    setUrl('')
  }, [url, onSubmit])

  const handleHistoryClick = useCallback((historyUrl: string) => {
    setUrl(historyUrl)
    setShowHistory(false)
  }, [])

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={e => {
            setUrl(e.target.value)
            setError(null)
          }}
          onFocus={() => history.length > 0 && setShowHistory(true)}
          onBlur={() => setTimeout(() => setShowHistory(false), 200)}
          placeholder="输入在线视频URL (mp4, webm, m3u8...)"
          className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                     text-white placeholder-white/30 text-sm
                     focus:outline-none focus:border-[#e94560]/50 transition-colors"
        />
        <button
          type="submit"
          disabled={!url.trim()}
          className="px-6 py-3 bg-[#e94560] hover:bg-[#e94560]/80 disabled:opacity-40
                     disabled:cursor-not-allowed text-white font-medium rounded-xl
                     transition-colors text-sm whitespace-nowrap"
        >
          播放
        </button>
      </div>

      {error && (
        <p className="text-red-400 text-xs mt-1 ml-1">{error}</p>
      )}

      {/* URL历史下拉 */}
      {showHistory && history.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-[#1a1a2e] border border-white/10
                        rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
          <div className="px-3 py-2 text-xs text-white/40 border-b border-white/5">
            历史记录
          </div>
          {history.map((h, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleHistoryClick(h)}
              className="w-full px-3 py-2 text-left text-sm text-white/70 hover:bg-white/10
                         transition-colors truncate"
            >
              {h}
            </button>
          ))}
        </div>
      )}
    </form>
  )
}
