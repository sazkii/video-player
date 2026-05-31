import { describe, it, expect } from 'vitest'
import { formatTime } from '../utils/formatTime'

describe('formatTime', () => {
  it('formats seconds to MM:SS', () => {
    expect(formatTime(0)).toBe('00:00')
    expect(formatTime(65)).toBe('01:05')
    expect(formatTime(599)).toBe('09:59')
  })

  it('formats hours to HH:MM:SS', () => {
    expect(formatTime(3600)).toBe('1:00:00')
    expect(formatTime(3661)).toBe('1:01:01')
    expect(formatTime(7200)).toBe('2:00:00')
  })

  it('handles edge cases', () => {
    expect(formatTime(-1)).toBe('00:00')
    expect(formatTime(NaN)).toBe('00:00')
    expect(formatTime(Infinity)).toBe('00:00')
  })
})
