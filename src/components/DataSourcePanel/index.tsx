import { useState, useCallback } from 'react'
import type { Theme, DataSource, DataSourceCategory } from '../../types/video'
import { storage } from '../../utils/storage'
import { PRESET_DATA_SOURCES, getSourceCategories } from '../../data/presets'
import { DataSourceItem } from './DataSourceItem'
import { DataSourceForm } from './DataSourceForm'

interface DataSourcePanelProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (url: string) => void
  theme: Theme
}

export function DataSourcePanel({ isOpen, onClose, onSelect, theme }: DataSourcePanelProps) {
  const [activeTab, setActiveTab] = useState<'preset' | 'custom'>('preset')
  const [filterCategory, setFilterCategory] = useState<DataSourceCategory | 'preset'>('preset')
  const [showForm, setShowForm] = useState(false)
  const [editingSource, setEditingSource] = useState<DataSource | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const isDark = theme === 'dark'

  const customSources = storage.getDataSources()
  const categories = getSourceCategories()

  const getFilteredSources = useCallback((): DataSource[] => {
    const sources = activeTab === 'preset' ? PRESET_DATA_SOURCES : customSources

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return sources.filter(
        s =>
          s.name.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q) ||
          s.url.toLowerCase().includes(q),
      )
    }

    if (activeTab === 'preset' && filterCategory !== 'preset') {
      return sources.filter(s => s.category === filterCategory)
    }

    return sources
  }, [activeTab, filterCategory, searchQuery, customSources])

  const filteredSources = getFilteredSources()

  const handlePlay = useCallback(
    (url: string) => {
      onSelect(url)
      onClose()
    },
    [onSelect, onClose],
  )

  const handleEdit = useCallback((source: DataSource) => {
    setEditingSource(source)
    setShowForm(true)
  }, [])

  const handleDelete = useCallback((id: string) => {
    storage.removeDataSource(id)
    setEditingSource(null)
  }, [])

  const handleSave = useCallback(() => {
    setShowForm(false)
    setEditingSource(null)
  }, [])

  const handleCancel = useCallback(() => {
    setShowForm(false)
    setEditingSource(null)
  }, [])

  if (!isOpen) return null

  return (
    <>
      {/* 遮罩层 */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* 面板 */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-md border-l z-50 flex flex-col shadow-2xl
        ${isDark ? 'bg-[#121212] border-white/10' : 'bg-white border-gray-200'}`}>
        {/* 头部 */}
        <div className={`flex items-center justify-between px-4 py-3 border-b
          ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
          <h2 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
            数据源配置
          </h2>
          <button
            onClick={onClose}
            className={`p-1.5 rounded transition-colors
              ${isDark ? 'text-white/40 hover:text-white/70 hover:bg-white/5' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* 搜索框 */}
        <div className="px-4 pt-3">
          <div className="relative">
            <svg
              className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/30' : 'text-gray-400'}`}
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索数据源..."
              className={`w-full pl-9 pr-3 py-2 border rounded-lg text-sm transition-colors
                focus:outline-none focus:border-[#e94560]/50
                ${isDark
                  ? 'bg-white/5 border-white/10 text-white placeholder-white/30'
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                }`}
            />
          </div>
        </div>

        {/* 标签页 */}
        <div className={`flex px-4 gap-1 pt-3 ${isDark ? '' : ''}`}>
          {(['preset', 'custom'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setShowForm(false); setEditingSource(null) }}
              className={`flex-1 px-3 py-2 text-xs rounded-lg transition-colors font-medium
                ${activeTab === tab
                  ? 'bg-[#e94560]/15 text-[#e94560]'
                  : isDark
                    ? 'text-white/50 hover:text-white/70 hover:bg-white/5'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
            >
              {tab === 'preset' ? '预设数据源' : `自定义数据源 (${customSources.length})`}
            </button>
          ))}
        </div>

        {/* 分类过滤（仅预设 tab 显示） */}
        {activeTab === 'preset' && !showForm && (
          <div className="flex gap-1 px-4 pt-2 overflow-x-auto">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                className={`flex-shrink-0 px-2.5 py-1 text-[10px] rounded-full transition-colors
                  ${filterCategory === cat.id
                    ? 'bg-[#e94560]/15 text-[#e94560] font-medium'
                    : isDark
                      ? 'text-white/40 hover:text-white/60'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
              >
                {cat.name} ({cat.count})
              </button>
            ))}
          </div>
        )}

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {showForm ? (
            <DataSourceForm
              theme={theme}
              initialData={editingSource ?? undefined}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          ) : activeTab === 'custom' && filteredSources.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-4xl mb-3">📦</div>
              <p className={`text-sm mb-2 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                暂无自定义数据源
              </p>
              <p className={`text-xs ${isDark ? 'text-white/20' : 'text-gray-400'}`}>
                点击下方按钮添加你的视频源
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredSources.map(source => (
                <DataSourceItem
                  key={source.id}
                  source={source}
                  isCustom={activeTab === 'custom'}
                  onPlay={handlePlay}
                  onEdit={activeTab === 'custom' ? () => handleEdit(source) : undefined}
                  onDelete={
                    activeTab === 'custom'
                      ? () => handleDelete(source.id)
                      : undefined
                  }
                  theme={theme}
                />
              ))}
            </div>
          )}
        </div>

        {/* 底部操作 */}
        <div className={`px-4 py-3 border-t ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
          {activeTab === 'custom' ? (
            <button
              onClick={() => { setEditingSource(null); setShowForm(true) }}
              className="w-full px-4 py-2.5 bg-[#e94560] hover:bg-[#e94560]/80
                         text-white text-sm font-medium rounded-xl transition-colors"
            >
              + 添加自定义数据源
            </button>
          ) : (
            <p className={`text-center text-xs ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
              共 {filteredSources.length} 个预设数据源
            </p>
          )}
        </div>
      </div>
    </>
  )
}
