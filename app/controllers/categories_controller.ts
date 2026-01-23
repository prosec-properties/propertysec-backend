import { getErrorObject } from '#helpers/error'
import Category from '#models/category'
import type { HttpContext } from '@adonisjs/core/http'
import cache from '@adonisjs/cache/services/main'

export default class CategoriesController {
  async index({ request, response }: HttpContext) {
    try {
      const { sortBy = 'created_at', order = 'desc', search = '', type } = request.qs()

      const validOrders = ['asc', 'desc']
      if (!validOrders.includes(order.toLowerCase())) {
        return response.badRequest({
          success: false,
          message: 'Invalid order parameter. Use "asc" or "desc"',
        })
      }

      const sortableColumns = ['name', 'created_at', 'updated_at', 'status']
      if (!sortableColumns.includes(sortBy)) {
        return response.badRequest({
          success: false,
          message: `Invalid sortBy parameter. Use one of: ${sortableColumns.join(', ')}`,
        })
      }

      // Generate cache key based on most common filters
      const cacheKey = `categories:${type || 'all'}:${search || 'none'}:${sortBy}:${order}`

      const categories = await cache.getOrSet({
        key: cacheKey,
        factory: async () => {
          const query = Category.query()

          if (search) {
            query.whereILike('name', `%${search}%`)
          }

          if (type) {
            query.where('type', type)
          }

          query.preload('subcategories').orderBy(sortBy, order)
          const result = await query.exec()
          return result.map((r) => r.toJSON())
        },
        ttl: '5m',
      })

      return response.ok({
        success: true,
        message: 'Categories fetched successfully',
        data: categories,
      })
    } catch (error) {
      console.error('Error fetching categories:', error)
      return response.badRequest(getErrorObject(error))
    }
  }
}
