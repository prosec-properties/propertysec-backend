import { getErrorObject } from '#helpers/error'
import Product from '#models/product'
import { createProductValidator, updateProductValidator } from '#validators/product'
import type { HttpContext } from '@adonisjs/core/http'
import FilesService from '#services/files'
import ProductFile from '#models/product_file'
import { MultipartFile } from '@adonisjs/core/bodyparser'

export default class ProductsController {
  async index({ response, request, logger }: HttpContext) {
    try {
      const page = request.input('page', 1)
      const limit = request.input('limit', 20)

      const products = await Product.query()
        .preload('files')
        .orderBy('created_at', 'desc')
        .paginate(page, limit)

      logger.info('Products fetched successfully')
      return response.ok({
        success: true,
        message: 'Products fetched successfully',
        data: products.toJSON(),
      })
    } catch (error) {
      console.error(error)
      return response.badRequest(getErrorObject(error))
    }
  }

  async store({ auth, request, response, logger }: HttpContext) {
    try {
      await auth.authenticate()
      const user = auth.user!
      const { files, ...payload } = await request.validateUsing(createProductValidator)

      // Validate and upload files
      // ... similar logic as in PropertiesController.store ...

      logger.info('Product created successfully')
      return response.created({
        success: true,
        message: 'Product created successfully',
        data: product,
      })
    } catch (error) {
      return response.badRequest(getErrorObject(error))
    }
  }

  async show({ logger, response, params }: HttpContext) {
    try {
      const product = await Product.query().where('id', params.id).preload('files').firstOrFail()
      logger.info('Product fetched successfully')
      return response.ok({
        success: true,
        message: 'Product fetched successfully',
        data: product,
      })
    } catch (error) {
      response.badRequest(getErrorObject(error))
    }
  }

  async update({ logger, response, request, params }: HttpContext) {
    try {
      const product = await Product.findOrFail(params.id)
      const payload = await request.validateUsing(updateProductValidator)

      // Update logic similar to PropertiesController.update
      // ... handle file uploads and updates ...

      logger.info('Product updated successfully')
      return response.ok({
        success: true,
        message: 'Product updated successfully',
        data: product,
      })
    } catch (error) {
      logger.error(error)
      return response.badRequest(getErrorObject(error))
    }
  }

  async destroy({ logger, response, params }: HttpContext) {
    try {
      const product = await Product.findOrFail(params.id)
      await product.delete()
      logger.info('Product deleted successfully')
      return response.ok({
        success: true,
        message: 'Product deleted successfully',
      })
    } catch (error) {
      response.badRequest(getErrorObject(error))
    }
  }
} 