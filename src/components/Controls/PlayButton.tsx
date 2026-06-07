interface PlayButtonProps {
  isPlaying: boolean
  onClick: () => void
}

export function PlayButton({ isPlaying, onClick }: PlayButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-10 h-10 flex items-center justify-center text-white/90 hover:text-white transition-colors"
      title={isPlaying ? '暂停 (空格)' : '播放 (空格)'}
    >
      {isPlaying ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16" rx="1" />
          <rect x="14" y="4" width="4" height="16" rx="1" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="7,3 7,21 20,12" />
        </svg>
      )}
    </button>
  )
}
