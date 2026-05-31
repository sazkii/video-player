/** URL验证结果 */
export interface URLValidationResult {
  valid: boolean
  type?: 'direct' | 'hls'
  error?: string
}

const DIRECT_VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov', '.avi']
const HLS_EXTENSIONS = ['.m3u8']

/**
 * 验证视频URL有效性
 * @param url - URL字符串
 * @returns 验证结果，包含类型和错误信息
 */
export function validateVideoURL(url: string): URLValidationResult {
  if (!url || !url.trim()) {
    return { valid: false, error: '请输入视频URL' }
  }

  // 尝试解析URL
  let parsed: URL
  try {
    parsed = new URL(url.trim())
  } catch {
    return { valid: false, error: 'URL格式无效' }
  }

  // 只允许 http 和 https
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { valid: false, error: '只支持 HTTP/HTTPS 协议' }
  }

  const pathname = parsed.pathname.toLowerCase()

  // 检查是否是 HLS 流
  if (HLS_EXTENSIONS.some(ext => pathname.endsWith(ext))) {
    return { valid: true, type: 'hls' }
  }

  // 检查是否是直接视频文件
  if (DIRECT_VIDEO_EXTENSIONS.some(ext => pathname.endsWith(ext))) {
    return { valid: true, type: 'direct' }
  }

  // 没有明确扩展名时，允许尝试加载（可能是动态生成的视频流）
  return { valid: true, type: 'direct' }
}

/** 允许的视频MIME类型 */
export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
]

/** 验证文件是否是视频类型 */
export function isVideoFile(file: File): boolean {
  if (ALLOWED_VIDEO_TYPES.includes(file.type)) {
    return true
  }
  // 回退：检查扩展名
  const name = file.name.toLowerCase()
  return ['.mp4', '.webm', '.ogg', '.mov'].some(ext => name.endsWith(ext))
}
