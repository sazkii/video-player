import { formatTime } from '../../utils/formatTime'

interface TimeDisplayProps {
  currentTime: number
  duration: number
}

export function TimeDisplay({ currentTime, duration }: TimeDisplayProps) {
  return (
    <span className="text-[12px] text-white/60 font-mono whitespace-nowrap select-none ml-1">
      {formatTime(currentTime)} / {formatTime(duration)}
    </span>
  )
}
