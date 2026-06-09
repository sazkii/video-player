import { useNavigate } from 'react-router-dom'
import { useHistory } from '@/hooks/queries/useHistory'

function formatDuration(s: number): string {
  if (!s || !isFinite(s)) return ''
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return h > 0 ? `${h}小时${m}分` : `${m}分`
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins}分钟前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}小时前`
  return `${Math.floor(hours / 24)}天前`
}

export default function HistoryPage() {
  const navigate = useNavigate()
  const { data, isLoading } = useHistory()
  const history = data?.history ?? []

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent/60 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-white px-4 md:px-10 py-8">
      <h1 className="text-2xl font-bold mb-6">观看历史</h1>

      {history.length === 0 ? (
        <p className="text-text-secondary text-center py-16">还没有观看记录</p>
      ) : (
        <div className="space-y-2">
          {history.map(item => {
            const progress = item.duration
              ? Math.round((item.current_time / item.duration) * 100)
              : 0
            return (
              <button
                key={item.id}
                onClick={() =>
                  navigate('/detail', {
                    state: { url: item.url, siteId: item.site_id, title: item.title },
                  })
                }
                className="w-full flex items-center gap-4 bg-transparent hover:bg-surface-4
                           rounded-xl p-3 transition-colors text-left"
              >
                <div className="w-[160px] aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-surface-2">
                  {item.poster ? (
                    <img src={item.poster} alt="" className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">
                      暂无
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{item.title}</p>
                  {item.episode_name && (
                    <p className="text-xs text-text-secondary mt-0.5">{item.episode_name}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1 bg-white/10 rounded-full">
                      <div
                        className="h-full bg-accent rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-text-secondary whitespace-nowrap">
                      {formatDuration(item.current_time)} / {formatDuration(item.duration)}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] text-text-secondary whitespace-nowrap hidden sm:block">
                  {timeAgo(item.updated_at)}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
