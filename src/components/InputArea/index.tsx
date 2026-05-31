import { DropZone } from './DropZone'
import { URLInput } from './URLInput'

interface InputAreaProps {
  onFileSelect: (file: File) => void
  onURLSubmit: (url: string) => void
  isLoading: boolean
  error: string | null
  onClearError: () => void
}

export function InputArea({ onFileSelect, onURLSubmit, isLoading, error, onClearError }: InputAreaProps) {
  return (
    <div className="w-full max-w-4xl mx-auto px-6 space-y-4">
      <DropZone onFileSelect={onFileSelect} />

      <div className="text-center text-white/20 text-xs">或者</div>

      <URLInput onSubmit={onURLSubmit} />

      {isLoading && (
        <div className="text-center text-[#e94560] text-sm">
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
            className="text-white/40 hover:text-white ml-1"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
