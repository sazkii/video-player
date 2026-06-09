import { useState, useRef, useEffect } from 'react'
import type { PlaybackRate } from '../../types/video'

interface SpeedControlProps {
  playbackRate: PlaybackRate
  playbackRates: PlaybackRate[]
  onRateChange: (rate: PlaybackRate) => void
}

export function SpeedControl({ playbackRate, playbackRates, onRateChange }: SpeedControlProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 px-2 text-[13px] text-white/70 hover:text-white transition-colors
                   font-mono flex items-center"
        title="播放速度"
      >
        {playbackRate !== 1 && (
          <span className="text-[#ff0000] text-xs font-medium">{playbackRate}x</span>
        )}
        {playbackRate === 1 && (
          <span className="text-[12px]">倍速</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 right-0 bg-[#1a1a1a] border border-white/[0.08]
                        rounded-xl shadow-2xl shadow-black/40 py-1 min-w-[80px] z-50">
          {playbackRates.map(rate => (
            <button
              key={rate}
              onClick={() => {
                onRateChange(rate)
                setIsOpen(false)
              }}
              className={`w-full px-3 py-1.5 text-[13px] text-left hover:bg-white/10 transition-colors
                ${rate === playbackRate ? 'text-[#ff0000] font-medium' : 'text-white/70'}`}
            >
              {rate}x {rate === 1 && <span className="text-white/30 text-[11px]">正常</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
