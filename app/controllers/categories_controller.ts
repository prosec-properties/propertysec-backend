import { getErrorObject } from '#helpers/error'
import Category from '#models/category'
import type { HttpContext } from '@adonisjs/core/http'

export default class CategoriesController {
  async index({ response }: HttpContext) {
    try {
      const categories = await Category.query()

      console.log(categories)

      return response.json({
        status: 'success',
        data: categories,
      })
    } catch (error) {
      return response.badRequest(getErrorObject(error))
    }
  }
}
