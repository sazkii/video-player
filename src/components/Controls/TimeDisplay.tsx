import { formatTime } from '../../utils/formatTime'

interface TimeDisplayProps {
  currentTime: number
  duration: number
}

export function TimeDisplay({ currentTime, duration }: TimeDisplayProps) {
  return (
    <span className="text-sm text-white/80 font-mono whitespace-nowrap select-none">
      {formatTime(currentTime)} / {formatTime(duration)}
    </span>
  )
}
