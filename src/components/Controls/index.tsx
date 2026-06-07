import type { UseVideoPlayerReturn } from '../../hooks/useVideoPlayer'
import { PlayButton } from './PlayButton'
import { ProgressBar } from './ProgressBar'
import { TimeDisplay } from './TimeDisplay'
import { VolumeControl } from './VolumeControl'
import { SpeedControl } from './SpeedControl'
import { PiPButton } from './PiPButton'
import { FullscreenButton } from './FullscreenButton'
import { SkipButton } from './SkipButton'

interface ControlsProps {
  player: UseVideoPlayerReturn
  visible: boolean
}

export function Controls({ player, visible }: ControlsProps) {
  return (
    <div
      className={`absolute bottom-0 left-0 right-0 transition-all duration-300
                  ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}
    >
      {/* 渐变背景 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

      <div className="relative px-4 pb-3 pt-10">
        {/* 进度条 */}
        <ProgressBar
          currentTime={player.currentTime}
          duration={player.duration}
          buffered={player.buffered}
          onSeek={player.seekTo}
        />

        {/* 控制按钮行 */}
        <div className="flex items-center justify-between mt-0.5">
          <div className="flex items-center gap-0.5">
            <PlayButton isPlaying={player.isPlaying} onClick={player.togglePlay} />
            <SkipButton direction="backward" seconds={10} onClick={() => player.skip(-10)} />
            <SkipButton direction="forward" seconds={10} onClick={() => player.skip(10)} />
            <VolumeControl
              volume={player.volume}
              isMuted={player.isMuted}
              onVolumeChange={player.setVolume}
              onToggleMute={player.toggleMute}
            />
            <TimeDisplay currentTime={player.currentTime} duration={player.duration} />
          </div>

          <div className="flex items-center gap-0.5">
            {player.playbackRate !== 1 && (
              <span className="text-[11px] text-[#e94560] font-mono mr-1 font-medium">
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
