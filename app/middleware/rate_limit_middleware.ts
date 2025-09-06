import type { HttpContext } from '@adonisjs/core/http'
import { Exception } from '@adonisjs/core/exceptions'
import env from '#start/env'

interface RateLimitRecord {
  count: number
  resetTime: number
}

export default class RateLimit {
  /**
   * In-memory fallback store (used when LIMITER_STORE !== 'redis')
   */
  private static requests: Map<string, RateLimitRecord> = new Map()
  private static cleanupCounter = 0

  public async handle(
    { request, response }: HttpContext,
    next: () => Promise<void>,
    guards: string[]
  ) {
    // Guards: [maxRequests, windowSeconds]
    const [limit, window] = guards || []

    if (!limit || !window || isNaN(Number(limit)) || isNaN(Number(window))) {
      throw new Exception('Rate limiter misconfigured. Expecting [limit, windowSeconds].', { status: 500 })
    }

    const maxRequests = Math.max(1, parseInt(limit, 10))
    const windowSec = Math.max(1, parseInt(window, 10))
    const windowMs = windowSec * 1000

    // Use IP + route pattern (not query string) for stability
    const ip = request.ip() || 'unknown'
    const routeId = request.url(true).split('?')[0]
    const key = `rl:${routeId}:${ip}`

    const store = env.get('LIMITER_STORE')

    if (store === 'redis') {
      await this.handleRedis({ key, maxRequests, windowMs, response })
    } else {
      this.handleMemory({ key, maxRequests, windowMs, response })
    }

    await next()
  }

  /**
   * Redis-backed limiter for horizontal scalability.
   */
  private async handleRedis({
    key,
    maxRequests,
    windowMs,
    response,
  }: {
    key: string
    maxRequests: number
    windowMs: number
    response: HttpContext['response']
  }) {
    // Lazy import to avoid requiring redis when LIMITER_STORE !== 'redis'
    let redis: typeof import('@adonisjs/redis/services/main').default
    try {
      const mod = await import('@adonisjs/redis/services/main')
      redis = mod.default
    } catch (error) {
      throw new Exception('Redis store selected but redis service is not available', { status: 500 })
    }
    // Atomic increment
    const current = await redis.incr(key)
    if (current === 1) {
      // set expiry only on first hit to avoid resetting window
      await redis.pexpire(key, windowMs)
    }
    const pttl = await redis.pttl(key) // remaining ms
    const resetTime = Date.now() + (pttl > 0 ? pttl : windowMs)

    // Headers
    response.header('X-RateLimit-Limit', maxRequests)
    response.header('X-RateLimit-Remaining', Math.max(0, maxRequests - current))
    response.header('X-RateLimit-Reset', Math.ceil(resetTime / 1000))

    if (current > maxRequests) {
      const retryAfter = Math.ceil((pttl > 0 ? pttl : windowMs) / 1000)
      response.header('Retry-After', retryAfter)
      throw new Exception('Too many requests', { status: 429 })
    }
  }

  /**
   * In-memory limiter (good for tests / dev). Not suitable for multi-instance production.
   */
  private handleMemory({
    key,
    maxRequests,
    windowMs,
    response,
  }: {
    key: string
    maxRequests: number
    windowMs: number
    response: HttpContext['response']
  }) {
    const now = Date.now()

    // Periodic cleanup (every 200 calls) to prevent memory leak
    if (RateLimit.cleanupCounter++ % 200 === 0) {
      for (const [storedKey, record] of RateLimit.requests) {
        if (now > record.resetTime) RateLimit.requests.delete(storedKey)
      }
    }

    let record = RateLimit.requests.get(key)
    if (!record || now > record.resetTime) {
      record = { count: 0, resetTime: now + windowMs }
    }

    if (record.count >= maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000)
      response.header('Retry-After', retryAfter)
      response.header('X-RateLimit-Limit', maxRequests)
      response.header('X-RateLimit-Remaining', 0)
      response.header('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000))
      throw new Exception('Too many requests', { status: 429 })
    }

    record.count += 1
    RateLimit.requests.set(key, record)

    response.header('X-RateLimit-Limit', maxRequests)
    response.header('X-RateLimit-Remaining', Math.max(0, maxRequests - record.count))
    response.header('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000))
  }
}