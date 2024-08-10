import * as crypto from 'crypto'
import * as path from 'path'
export function sha256(text: string) {
  return crypto.createHash('sha256').update(text).digest('hex')
}

export function fileNameHash(filename: string, random = true) {
  const rand = random ? `${Date.now()}${Math.random()}` : ''
  const name = `${filename}-${rand}`
  return 'pro_sec_' + sha256(name) + path.extname(filename)
}
