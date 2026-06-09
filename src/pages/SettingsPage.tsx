import { useQueryClient } from '@tanstack/react-query'
import { useSites } from '@/hooks/queries/useSites'
import { toggleSite } from '@/lib/api'
import { Settings } from 'lucide-react'

export default function SettingsPage() {
  const { data, isLoading } = useSites()
  const qc = useQueryClient()
  const sites = data?.sites ?? []

  const handleToggle = async (id: string, enabled: boolean) => {
    await toggleSite(id, enabled)
    qc.invalidateQueries({ queryKey: ['sites'] })
  }

  return (
    <div className="min-h-screen bg-background text-white px-4 md:px-10 py-8">
      <h1 className="text-2xl font-bold mb-8 flex items-center gap-2">
        <Settings size={24} />
        设置
      </h1>

      <section className="mb-8">
        <h2 className="text-base font-semibold mb-4 text-text-primary">数据源管理</h2>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-accent/60 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : sites.length === 0 ? (
          <p className="text-text-secondary text-sm">
            暂无站点。请在后端 server/src/index.ts 中注册站点适配器。
          </p>
        ) : (
          <div className="space-y-1">
            {sites.map(site => (
              <div
                key={site.id}
                className="flex items-center justify-between bg-surface-4 rounded-xl px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-text-primary">{site.name}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{site.id}</p>
                </div>
                <button
                  onClick={() => handleToggle(site.id, !site.enabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative
                    ${site.enabled ? 'bg-accent' : 'bg-[#4d4d4d]'}`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform
                      ${site.enabled ? 'translate-x-5.5' : 'translate-x-0.5'}`}
                  />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-base font-semibold mb-4 text-text-primary">关于</h2>
        <div className="bg-surface-4 rounded-xl px-4 py-3 text-sm text-text-secondary space-y-1">
          <p>CinemaFlow Video Player v2.0</p>
          <p>Node.js 后端 + React 前端</p>
          <p>支持 iOS (Capacitor) / PC 浏览器</p>
        </div>
      </section>
    </div>
  )
}
