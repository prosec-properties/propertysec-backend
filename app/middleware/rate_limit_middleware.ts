import type { HttpContext } from '@adonisjs/core/http'
import { Exception } from '@adonisjs/core/exceptions'

interface RateLimitRecord {
  count: number
  resetTime: number
}

export default class RateLimit {
  private static requests: Map<string, RateLimitRecord> = new Map()

  public async handle(
    { request, response }: HttpContext,
    next: () => Promise<void>,
    guards: string[]
  ) {
    const [limit, window] = guards
    const maxRequests = parseInt(limit)
    const windowMs = parseInt(window) * 1000 // Convert to milliseconds

    const ip = request.ip()
    const key = `${ip}:${request.url()}`
    const now = Date.now()

    // Clean up old records
    if (RateLimit.requests.has(key)) {
      const record = RateLimit.requests.get(key)!
      if (now > record.resetTime) {
        RateLimit.requests.delete(key)
      }
    }

    // Get or create record
    const record = RateLimit.requests.get(key) || {
      count: 0,
      resetTime: now + windowMs,
    }

    // Check if limit exceeded
    if (record.count >= maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000)
      response.header('Retry-After', retryAfter)
      throw new Exception('Too many requests', { status: 429 })
    }

    // Increment counter
    record.count++
    RateLimit.requests.set(key, record)

    // Set rate limit headers
    response.header('X-RateLimit-Limit', maxRequests)
    response.header('X-RateLimit-Remaining', Math.max(0, maxRequests - record.count))
    response.header('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000))

    await next()
  }
} 