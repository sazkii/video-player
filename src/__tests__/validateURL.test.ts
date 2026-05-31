import { describe, it, expect } from 'vitest'
import { validateVideoURL, isVideoFile } from '../utils/validateURL'

describe('validateVideoURL', () => {
  it('rejects empty URLs', () => {
    expect(validateVideoURL('').valid).toBe(false)
    expect(validateVideoURL('  ').valid).toBe(false)
  })

  it('rejects non-HTTP protocols', () => {
    expect(validateVideoURL('ftp://example.com/video.mp4').valid).toBe(false)
    expect(validateVideoURL('file:///local/video.mp4').valid).toBe(false)
  })

  it('accepts direct video URLs', () => {
    const result = validateVideoURL('https://example.com/video.mp4')
    expect(result.valid).toBe(true)
    expect(result.type).toBe('direct')
  })

  it('detects HLS streams', () => {
    const result = validateVideoURL('https://example.com/stream.m3u8')
    expect(result.valid).toBe(true)
    expect(result.type).toBe('hls')
  })

  it('accepts URLs without known extensions', () => {
    const result = validateVideoURL('https://example.com/stream')
    expect(result.valid).toBe(true)
  })
})

describe('isVideoFile', () => {
  it('accepts video MIME types', () => {
    const mp4 = new File([''], 'test.mp4', { type: 'video/mp4' })
    const webm = new File([''], 'test.webm', { type: 'video/webm' })
    expect(isVideoFile(mp4)).toBe(true)
    expect(isVideoFile(webm)).toBe(true)
  })

  it('rejects non-video files', () => {
    const txt = new File([''], 'test.txt', { type: 'text/plain' })
    const img = new File([''], 'test.png', { type: 'image/png' })
    expect(isVideoFile(txt)).toBe(false)
    expect(isVideoFile(img)).toBe(false)
  })

  it('accepts by extension fallback', () => {
    const file = new File([''], 'test.mp4', { type: '' })
    expect(isVideoFile(file)).toBe(true)
  })
})
