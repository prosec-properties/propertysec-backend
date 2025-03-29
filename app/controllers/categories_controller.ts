import { getErrorObject } from '#helpers/error'
import Category from '#models/category'
import type { HttpContext } from '@adonisjs/core/http'

export default class CategoriesController {
  async index({ request, response }: HttpContext) {
    try {
      const { sortBy = 'created_at', order = 'desc', search = '', type } = request.qs()

      console.log('query params:', request.qs())
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

      const query = Category.query()

      if (search) {
        query.whereILike('name', `%${search}%`)
      }

      if (type) {
        console.log('Type:', type)
        query.where('type', type)
      }

      query.preload('subcategories').orderBy(sortBy, order)

      const categories = await query.exec()

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
