import { useState, useCallback } from 'react'
import type { Theme } from '../../types/video'
import { validateVideoURL } from '../../utils/validateURL'
import { storage } from '../../utils/storage'

interface URLInputProps {
  theme: Theme
  onSubmit: (url: string) => void
}

export function URLInput({ theme, onSubmit }: URLInputProps) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const isDark = theme === 'dark'

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
          className={`flex-1 px-4 py-3 border rounded-xl text-sm transition-colors
            focus:outline-none
            ${isDark
              ? 'bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-[#e94560]/50'
              : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#e94560]/50'
            }`}
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
        <div className={`absolute top-full mt-1 w-full border rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto
          ${isDark ? 'bg-[#1a1a2e] border-white/10' : 'bg-white border-gray-200'}`}
        >
          <div className={`px-3 py-2 text-xs border-b
            ${isDark ? 'text-white/40 border-white/5' : 'text-gray-400 border-gray-100'}`}>
            历史记录
          </div>
          {history.map((h, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleHistoryClick(h)}
              className={`w-full px-3 py-2 text-left text-sm truncate transition-colors
                ${isDark
                  ? 'text-white/70 hover:bg-white/10'
                  : 'text-gray-700 hover:bg-gray-50'
                }`}
            >
              {h}
            </button>
          ))}
        </div>
      )}
    </form>
  )
}
