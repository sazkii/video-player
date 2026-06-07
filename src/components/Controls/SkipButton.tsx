interface SkipButtonProps {
  direction: 'backward' | 'forward'
  seconds: number
  onClick: () => void
}

export function SkipButton({ direction, seconds, onClick }: SkipButtonProps) {
  const isBack = direction === 'backward'

  return (
    <button
      onClick={onClick}
      className="w-10 h-10 flex items-center justify-center text-white/90 hover:text-white transition-colors relative group/skip"
      title={isBack ? `后退${seconds}秒 (←)` : `快进${seconds}秒 (→)`}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        {isBack ? (
          <>
            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6" strokeLinecap="round" strokeLinejoin="round" />
          </>
        ) : (
          <>
            <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}
      </svg>
      <span className="absolute -bottom-0.5 text-[9px] font-mono text-white/60 select-none">
        {seconds}
      </span>
    </button>
  )
}
