import { getErrorObject } from '#helpers/error'
import Category from '#models/category'
import type { HttpContext } from '@adonisjs/core/http'

export default class CategoriesController {
  async index({ request, response }: HttpContext) {
    try {
      const sortBy = request.input('sortBy', 'created_at')
      const order = request.input('order', 'desc')
      const search = request.input('search', '')

      const query = Category.query()

      if (search) {
        query.whereILike('name', `%${search}%`)
      }

      query.orderBy(sortBy, order)

      const categories = await query

      return response.ok({
        success: true,
        message: 'Categories fetched successfully',
        data: categories,
      })
    } catch (error) {
      return response.badRequest(getErrorObject(error))
    }
  }
}
