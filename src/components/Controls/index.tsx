import type { UseVideoPlayerReturn } from '../../hooks/useVideoPlayer'
import { PlayButton } from './PlayButton'
import { ProgressBar } from './ProgressBar'
import { TimeDisplay } from './TimeDisplay'
import { VolumeControl } from './VolumeControl'
import { SpeedControl } from './SpeedControl'
import { PiPButton } from './PiPButton'
import { FullscreenButton } from './FullscreenButton'

interface ControlsProps {
  player: UseVideoPlayerReturn
  visible: boolean
}

export function Controls({ player, visible }: ControlsProps) {
  return (
    <div
      className={`absolute bottom-0 left-0 right-0 transition-opacity duration-300
                  ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      {/* 渐变背景 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      <div className="relative px-4 pb-3 pt-8">
        {/* 进度条 */}
        <ProgressBar
          currentTime={player.currentTime}
          duration={player.duration}
          buffered={player.buffered}
          onSeek={player.seekTo}
        />

        {/* 控制按钮行 */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1">
            <PlayButton isPlaying={player.isPlaying} onClick={player.togglePlay} />
            <VolumeControl
              volume={player.volume}
              isMuted={player.isMuted}
              onVolumeChange={player.setVolume}
              onToggleMute={player.toggleMute}
            />
            <TimeDisplay currentTime={player.currentTime} duration={player.duration} />
          </div>

          <div className="flex items-center gap-1">
            {player.playbackRate !== 1 && (
              <span className="text-xs text-[#e94560] font-mono mr-1">
                {player.playbackRate}x
              </span>
            )}
            <SpeedControl
              playbackRate={player.playbackRate}
              playbackRates={player.playbackRates}
              onRateChange={player.setPlaybackRate}
            />
            <PiPButton onClick={player.togglePiP} />
            <FullscreenButton
              isFullscreen={player.isFullscreen}
              onClick={player.toggleFullscreen}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
