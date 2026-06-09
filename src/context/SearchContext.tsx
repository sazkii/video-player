import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { SearchResult } from '../services/api'

interface SearchState {
  query: string
  results: SearchResult[]
  loading: boolean
  searched: boolean
}

interface SearchContextValue {
  searchState: SearchState
  setQuery: (q: string) => void
  setResults: (r: SearchResult[]) => void
  setLoading: (l: boolean) => void
  setSearched: (s: boolean) => void
}

const STORAGE_KEY = 'cinemaflow-search'

const INITIAL_STATE: SearchState = { query: '', results: [], loading: false, searched: false }

function loadFromStorage(): SearchState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return INITIAL_STATE
    const parsed = JSON.parse(raw) as Partial<SearchState>
    return { ...INITIAL_STATE, ...parsed, loading: false }
  } catch {
    return INITIAL_STATE
  }
}

const SearchContext = createContext<SearchContextValue | null>(null)

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [searchState, setSearchState] = useState<SearchState>(loadFromStorage)

  // 搜索状态变化时同步到 sessionStorage
  useEffect(() => {
    const { loading, ...toSave } = searchState
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
  }, [searchState.query, searchState.results, searchState.searched])

  const setQuery = useCallback((q: string) => {
    setSearchState(prev => ({ ...prev, query: q }))
  }, [])

  const setResults = useCallback((r: SearchResult[]) => {
    setSearchState(prev => ({ ...prev, results: r }))
  }, [])

  const setLoading = useCallback((l: boolean) => {
    setSearchState(prev => ({ ...prev, loading: l }))
  }, [])

  const setSearched = useCallback((s: boolean) => {
    setSearchState(prev => ({ ...prev, searched: s }))
  }, [])

  return (
    <SearchContext.Provider value={{ searchState, setQuery, setResults, setLoading, setSearched }}>
      {children}
    </SearchContext.Provider>
  )
}

export function useSearchState(): SearchContextValue {
  const ctx = useContext(SearchContext)
  if (!ctx) throw new Error('useSearchState must be used within SearchProvider')
  return ctx
}
