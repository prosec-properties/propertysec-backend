import { getErrorObject } from '#helpers/error'
import Product from '#models/product'
import { createProductValidator, updateProductValidator } from '#validators/product'
import type { HttpContext } from '@adonisjs/core/http'
import FilesService from '#services/files'
import ProductFile from '#models/product_file'
import db from '@adonisjs/lucid/services/db'
import { MultipartFile } from '@adonisjs/core/bodyparser'
import { NIGERIA_COUNTRY_ID } from '#constants/general'

export default class ProductsController {
  async index({ response, request, logger }: HttpContext) {
    try {
      const page = request.input('page', 1)
      const limit = request.input('limit', 20)
      const categoryId = request.input('categoryId')

      const query = Product.query().preload('files').preload('user').orderBy('created_at', 'desc')

      if (categoryId) {
        query.where('category_id', categoryId)
      }

      const products = await query.paginate(page, limit)

      logger.info('Products fetched successfully')
      return response.ok({
        success: true,
        message: 'Products fetched successfully',
        data: products.toJSON(),
      })
    } catch (error) {
      return response.badRequest(getErrorObject(error))
    }
  }

  async store({ auth, request, response, logger }: HttpContext) {
    try {
      await auth.authenticate()
      const user = auth.user!
      const { files, ...payload } = await request.validateUsing(createProductValidator)

      if (!files || !Array.isArray(files)) {
        return response.badRequest({
          success: false,
          message: 'Product images are required',
        })
      }

      for (const file of files) {
        if (file.type === 'image' && file.size > 5 * 1024 * 1024) {
          return response.badRequest({
            success: false,
            message: 'Image file size should not exceed 5MB',
          })
        }
      }

      const results = await FilesService.uploadFiles(files)

      if (!results.length) {
        return response.badRequest({
          success: false,
          message: 'Failed to upload product images',
        })
      }

      let product: Product | null = null
      try {
        product = await Product.create({
          ...payload,
          userId: user.id,
          views: 0,
          countryId: NIGERIA_COUNTRY_ID,
          availability: 'available',
          negotiable: payload.negotiable ?? true,
          quantity: payload.quantity ?? 1,
          status: 'pending',
        })

        const uploadedFiles = results.map(({ filename, url, metaData }, index) => ({
          fileName: filename,
          fileUrl: url,
          fileType: metaData.type,
          productId: product!.id,
          meta: JSON.stringify({
            ...metaData,
            isMain: index === 0,
          }),
        }))

        try {
          for (const fileInfo of uploadedFiles) {
            await FilesService.createProductFile(fileInfo as ProductFile)
          }
        } catch (error) {
          // If file saving fails, delete the product and return error
          if (product) {
            console.log('Deleting product due to file save error:', product.id)
            await product.delete()
          }
          return response.badRequest(getErrorObject(error))
        }

        await product.load('files')

        logger.info('Product created successfully')
        return response.created({
          success: true,
          message: 'Product created successfully',
          data: product,
        })
      } catch (error) {
        if (product) {
          await product.delete()
        }
        throw error
      }
    } catch (error) {
      return response.badRequest(getErrorObject(error))
    }
  }

  async show({ logger, response, params }: HttpContext) {
    try {
      const product = await Product.query()
        .where('id', params.id)
        .preload('files')
        .preload('user')
        .firstOrFail()

      await product.merge({ views: product.views + 1 }).save()

      logger.info('Product fetched successfully')
      return response.ok({
        success: true,
        message: 'Product fetched successfully',
        data: product,
      })
    } catch (error) {
      return response.badRequest(getErrorObject(error))
    }
  }

  async update({ auth, logger, response, request, params }: HttpContext) {
    try {
      await auth.authenticate()
      const product = await Product.findOrFail(params.id)

      // Check if user owns the product
      if (product.userId !== auth.user!.id) {
        return response.forbidden({
          success: false,
          message: 'Unauthorized to update this product',
        })
      }

      const { files, ...payload } = await request.validateUsing(updateProductValidator)

      const existingFiles = await product.related('files').query()
      const newFiles: MultipartFile[] = []

      if (files && Array.isArray(files)) {
        for (const file of files) {
          if (file.type?.startsWith('image/') && file.size > 5 * 1024 * 1024) {
            return response.badRequest({
              success: false,
              message: 'Image file size should not exceed 5MB',
            })
          }

          const fileExists = existingFiles.some(
            (existingFile) => existingFile.fileName === file.clientName
          )

          // If the file does not exist, add it to the newFiles array
          if (!fileExists) {
            newFiles.push(file)
          }
        }

        // Upload only new files
        if (newFiles.length > 0) {
          const results = await FilesService.uploadFiles(newFiles)

          const uploadedFiles = results.map(({ filename, url, metaData }) => ({
            fileName: filename,
            fileUrl: url,
            fileType: metaData.type,
            productId: product.id,
            meta: JSON.stringify(metaData),
          }))

          // Save new files to the database
          await Promise.all(
            uploadedFiles.map((fileInfo) => FilesService.createProductFile(fileInfo as ProductFile))
          )
        }
      }

      // Update product
      await product.merge(payload).save()
      await product.load('files')

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

  async myProducts({ auth, response, request, logger }: HttpContext) {
    try {
      await auth.authenticate()
      const user = auth.user!

      const page = request.input('page', 1)
      const limit = request.input('limit', 10)
      const status = request.input('status')

      const query = Product.query()
        .where('user_id', user.id)
        .preload('files')
        .orderBy('created_at', 'desc')

      if (status) {
        query.where('status', status)
      }

      const products = await query.paginate(page, limit)

      const statusCounts = await db
        .from('products')
        .select('status')
        .count('* as total')
        .where('user_id', user.id)
        .groupBy('status')

      logger.info('Products fetched successfully')
      return response.ok({
        success: true,
        message: 'Products fetched successfully',
        data: {
          products: products.toJSON(),
          statusCounts,
        },
      })
    } catch (error) {
      return response.badRequest(getErrorObject(error))
    }
  }

  async destroy({ auth, logger, response, params }: HttpContext) {
    try {
      await auth.authenticate()
      const product = await Product.findOrFail(params.id)

      // Check if user owns the product
      if (product.userId !== auth.user!.id) {
        return response.forbidden({
          success: false,
          message: 'Unauthorized to delete this product',
        })
      }

      // Delete associated files
      const files = await product.related('files').query()
      await Promise.all(files.map((file) => FilesService.deleteProductFile(file.fileName)))

      await product.delete()

      logger.info('Product deleted successfully')
      return response.ok({
        success: true,
        message: 'Product deleted successfully',
      })
    } catch (error) {
      return response.badRequest(getErrorObject(error))
    }
  }
}
