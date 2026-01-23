import { DateTime } from 'luxon'

interface CacheEntry<T> {
    data: T
    expiresAt: DateTime
}

/**
 * Simple in-memory TTL-based cache service.
 * Cache is cleared on server restart - suitable for frequently accessed, rarely-changing data.
 */
export default class CacheService {
    private static cache = new Map<string, CacheEntry<any>>()

    /**
     * Get a cached value by key
     */
    static get<T>(key: string): T | null {
        const entry = this.cache.get(key)

        if (!entry) {
            return null
        }

        // Check if expired
        if (DateTime.now() > entry.expiresAt) {
            this.cache.delete(key)
            return null
        }

        return entry.data as T
    }

    /**
     * Set a cached value with TTL in seconds
     */
    static set<T>(key: string, data: T, ttlSeconds: number): void {
        this.cache.set(key, {
            data,
            expiresAt: DateTime.now().plus({ seconds: ttlSeconds }),
        })
    }

    /**
     * Delete a specific cache entry
     */
    static delete(key: string): boolean {
        return this.cache.delete(key)
    }

    /**
     * Delete all cache entries matching a prefix
     */
    static deleteByPrefix(prefix: string): void {
        for (const key of this.cache.keys()) {
            if (key.startsWith(prefix)) {
                this.cache.delete(key)
            }
        }
    }

    /**
     * Clear all cache entries
     */
    static clear(): void {
        this.cache.clear()
    }

    /**
     * Get or set - returns cached value if exists, otherwise calls factory and caches result
     */
    static async getOrSet<T>(
        key: string,
        factory: () => Promise<T>,
        ttlSeconds: number
    ): Promise<T> {
        const cached = this.get<T>(key)
        if (cached !== null) {
            return cached
        }

        const data = await factory()
        this.set(key, data, ttlSeconds)
        return data
    }

    /**
     * Get cache statistics
     */
    static stats(): { size: number; keys: string[] } {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys()),
        }
    }
}

// Export cache key constants for consistency
export const CACHE_KEYS = {
    CATEGORIES: 'categories',
    COUNTRIES: 'countries',
    STATES: 'states',
    CITIES: (stateId: string) => `cities:${stateId}`,
    PLANS: 'plans',
    SETTINGS: 'settings',
} as const

// Export TTL constants (in seconds)
export const CACHE_TTL = {
    SHORT: 60, // 1 minute
    MEDIUM: 300, // 5 minutes
    LONG: 600, // 10 minutes
    HOUR: 3600, // 1 hour
} as const
