import type { Theme } from '../../types/video'
import { DropZone } from './DropZone'
import { URLInput } from './URLInput'

interface InputAreaProps {
  theme: Theme
  onFileSelect: (file: File) => void
  onURLSubmit: (url: string) => void
  isLoading: boolean
  error: string | null
  onClearError: () => void
}

export function InputArea({ theme, onFileSelect, onURLSubmit, isLoading, error, onClearError }: InputAreaProps) {
  const isDark = theme === 'dark'

  return (
    <div className="w-full max-w-4xl mx-auto px-6 space-y-4">
      <DropZone theme={theme} onFileSelect={onFileSelect} />

      <div className={`text-center text-xs ${isDark ? 'text-white/20' : 'text-gray-400'}`}>
        或者
      </div>

      <URLInput theme={theme} onSubmit={onURLSubmit} />

      {isLoading && (
        <div className="text-center text-[#ff0000] text-sm">
          <span className="inline-block animate-spin mr-2">⏳</span>
          加载中...
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center gap-2 text-red-400 text-sm">
          <span>⚠️</span>
          <span>{error}</span>
          <button
            onClick={onClearError}
            className={`ml-1 transition-colors ${isDark ? 'text-white/40 hover:text-white' : 'text-gray-400 hover:text-gray-700'}`}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
