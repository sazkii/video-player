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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* 面板 */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-[420px] border-l z-50 flex flex-col
        transition-transform duration-300
        ${isDark
          ? 'bg-[#0f0f0f] border-white/[0.06]'
          : 'bg-[#fafafa] border-gray-200'
        }`}
      >
        {/* 头部 */}
        <div className={`flex items-center justify-between px-5 py-4 border-b
          ${isDark ? 'border-white/[0.06]' : 'border-gray-200/60'}`}>
          <div>
            <h2 className={`font-semibold text-[15px] ${isDark ? 'text-white' : 'text-gray-900'}`}>
              数据源
            </h2>
            <p className={`text-[11px] mt-0.5 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
              选择视频源开始播放
            </p>
          </div>
          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors
              ${isDark
                ? 'hover:bg-white/[0.06] text-white/40 hover:text-white/70'
                : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
              }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* 搜索框 */}
        <div className="px-5 pt-4">
          <div className="relative">
            <svg
              className={`absolute left-3 top-1/2 -translate-y-1/2
                ${isDark ? 'text-white/25' : 'text-gray-400'}`}
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索..."
              className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none transition-colors
                ${isDark
                  ? 'bg-white/[0.04] text-white placeholder-white/25 focus:bg-white/[0.07]'
                  : 'bg-gray-100 text-gray-900 placeholder-gray-400 focus:bg-gray-50'
                }`}
            />
          </div>
        </div>

        {/* 标签页 */}
        <div className={`flex gap-1 px-5 pt-3`}>
          {(['preset', 'custom'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setShowForm(false); setEditingSource(null) }}
              className={`flex-1 px-3 py-2 text-[12px] rounded-lg transition-colors font-medium
                ${activeTab === tab
                  ? isDark
                    ? 'bg-white/[0.08] text-white'
                    : 'bg-white text-gray-900 shadow-sm'
                  : isDark
                    ? 'text-white/35 hover:text-white/60 hover:bg-white/[0.03]'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                }`}
            >
              {tab === 'preset' ? '预设' : `自定义 (${customSources.length})`}
            </button>
          ))}
        </div>

        {/* 分类过滤（仅预设 tab 显示） */}
        {activeTab === 'preset' && !showForm && (
          <div className="flex gap-1 px-5 pt-2.5 overflow-x-auto">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                className={`flex-shrink-0 px-2.5 py-1 text-[10px] rounded-full transition-colors
                  ${filterCategory === cat.id
                    ? isDark
                      ? 'bg-[#ff0000]/15 text-[#ff0000] font-medium'
                      : 'bg-[#ff0000]/10 text-[#ff0000] font-medium'
                    : isDark
                      ? 'text-white/30 hover:text-white/50'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
              >
                {cat.name} ({cat.count})
              </button>
            ))}
          </div>
        )}

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {showForm ? (
            <DataSourceForm
              theme={theme}
              initialData={editingSource ?? undefined}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          ) : activeTab === 'custom' && filteredSources.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className={`w-14 h-14 rounded-2xl mb-4 flex items-center justify-center
                ${isDark ? 'bg-white/[0.04]' : 'bg-gray-100'}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                  stroke={isDark ? 'rgba(255,255,255,0.15)' : '#d1d5db'} strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
              </div>
              <p className={`text-sm mb-1 ${isDark ? 'text-white/35' : 'text-gray-500'}`}>
                暂无自定义数据源
              </p>
              <p className={`text-xs ${isDark ? 'text-white/18' : 'text-gray-400'}`}>
                添加你自己的视频源
              </p>
            </div>
          ) : (
            <div className="space-y-0.5">
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
        <div className={`px-5 py-4 border-t
          ${isDark ? 'border-white/[0.06]' : 'border-gray-200/60'}`}>
          {activeTab === 'custom' ? (
            <button
              onClick={() => { setEditingSource(null); setShowForm(true) }}
              className="w-full py-2.5 bg-[#ff0000] hover:bg-[#ff0000]/85
                         text-white text-sm font-medium rounded-xl transition-colors"
            >
              + 添加数据源
            </button>
          ) : (
            <p className={`text-center text-[11px] ${isDark ? 'text-white/20' : 'text-gray-400'}`}>
              {filteredSources.length} 个可用数据源
            </p>
          )}
        </div>
      </div>
    </>
  )
}
