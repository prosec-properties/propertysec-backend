import { getErrorObject } from '#helpers/error'
import Property from '#models/property'
import { createPropertyValidator, updatePropertyValidator } from '#validators/property'
import type { HttpContext } from '@adonisjs/core/http'
import FilesService from '#services/files'
import PropertyFile from '#models/property_file'
import { MultipartFile } from '@adonisjs/core/bodyparser'
import { NIGERIA_COUNTRY_ID } from '#constants/general'
import vine from '@vinejs/vine'
import User from '#models/user'

export default class PropertiesController {
  async index({ response, request, logger }: HttpContext) {
    try {
      const page = request.input('page', 1)
      const limit = request.input('limit', 20)

      const { status, categories, locations, pricing, search } = request.qs()

      const properties = await Property.query()
        .if(status, (query) => {
          query.where('status', status)
        })
        .if(search, (query) => {
          query.where('title', 'ilike', `%${search}%`)
        })
        .if(categories, (query) => {
          const parsedCategories = JSON.parse(categories)
          if (Array.isArray(parsedCategories)) {
            query.whereIn('categoryId', parsedCategories)
          }
        })
        .if(locations, (query) => {
          const parsedLocations = JSON.parse(locations)
          if (Array.isArray(parsedLocations)) {
            query.whereIn('stateId', parsedLocations)
          }
        })
        .if(pricing, (query) => {
          const parsedPricing = JSON.parse(pricing)
          // Check if pricing is an array
          const pricingArray = Array.isArray(parsedPricing) ? parsedPricing : [parsedPricing]

          // Process each pricing filter
          pricingArray.forEach((priceFilter) => {
            // Extract the numeric part and the operator (+ or -)
            const match = priceFilter.match(/(\d+)([+-])/)

            if (match) {
              const [, priceValue, operator] = match
              const price = parseInt(priceValue, 10)

              if (operator === '+') {
                // Price above the specified value
                query.where('price', '>=', price)
              } else if (operator === '-') {
                // Price below the specified value
                query.where('price', '<=', price)
              }
            }
          })
        })
        .preload('files')
        .orderBy('created_at', 'desc')
        .paginate(page, limit)

      logger.info('Properties fetched successfully')
      return response.ok({
        success: true,
        message: 'Properties fetched successfully',
        data: properties.toJSON(),
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

      const isSubscribed = user.subscriptionStatus === 'active'
      const { files, ...payload } = await request.validateUsing(createPropertyValidator)

      if (files && Array.isArray(files)) {
        for (const file of files) {
          if (file.type?.startsWith('video/') && !isSubscribed) {
            return response.forbidden({
              success: false,
              message: 'Only subscribed users can upload videos.',
            })
          }
          if (file.type === 'image' && file.size > 5 * 1024 * 1024) {
            return response.badRequest({
              success: false,
              message: 'Image file size should not exceed 5mb',
            })
          }
        }

        const results = await FilesService.uploadFiles(files)

        if (!results.length) {
          return response.badRequest({
            success: false,
            message: 'Failed to upload one or more property images',
          })
        }

        let property: Property | null = null
        try {
          property = await Property.create({
            ...payload,
            status: 'draft',
            userId: user.id,
            availability: 'available',
            views: 0,
            countryId: NIGERIA_COUNTRY_ID,
            defaultImageUrl: results[0].url,
          })

          const uploadedFiles = results.map(({ filename, url, metaData }) => ({
            fileName: filename,
            fileUrl: url,
            fileType: metaData.type,
            propertyId: property?.id,
            meta: JSON.stringify(metaData),
          }))

          try {
            for (const fileInfo of uploadedFiles) {
              await FilesService.createPropertyFile(fileInfo as PropertyFile)
            }
          } catch (error) {
            if (property) {
              await property.delete()
            }
            return response.badRequest({
              success: false,
              message: 'Failed to save property images',
            })
          }

          logger.info('Property created successfully')
          return response.created({
            success: true,
            message: 'Property created successfully',
            data: property,
          })
        } catch (error) {
          return response.badRequest(getErrorObject(error))
        }
      }

      return response.badRequest({
        success: false,
        message: 'Property images are required',
      })
    } catch (error) {
      return response.badRequest(getErrorObject(error))
    }
  }

  async show({ logger, response, params, auth }: HttpContext) {
    try {
      let user: User | null = null
      try {
        user = await auth.authenticate()
      } catch (error) {}

      const property = await Property.query()
        .where('id', params.id)
        .if(!!user, (query) => {
          query.preload('inspections', (q) => {
            q.where('userId', user!.id)
          })
        })
        .preload('files')
        .firstOrFail()

      if (property.status === 'published' && property.userId !== auth.user?.id) {
        await property.merge({ views: property.views + 1 }).save()
      }
      logger.info('Property fetched successfully')

      return response.ok({
        success: true,
        message: 'Property fetched sucessfully',
        data: property,
      })
    } catch (error) {
      response.badRequest(getErrorObject(error))
    }
  }

  async update({ logger, response, request, params, auth }: HttpContext) {
    try {
      await auth.authenticate()
      const user = auth.user!
      const isSubscribed = user.subscriptionStatus === 'active'

      const property = await Property.findOrFail(params.id)
      const payload = await request.validateUsing(updatePropertyValidator)

      if (!payload) {
        return response.badRequest({
          success: false,
          message: 'Invalid payload',
        })
      }

      const existingFiles = await property.related('files').query()

      const newFiles: MultipartFile[] = []

      if (payload.files && Array.isArray(payload.files)) {
        for (const file of payload.files) {
          if (file.type?.startsWith('video/') && !isSubscribed) {
            return response.forbidden({
              success: false,
              message: 'Only subscribed users can upload videos.',
            })
          }
          if (file.type?.startsWith('image/') && file.size > 5 * 1024 * 1024) {
            return response.badRequest({
              success: false,
              message: 'Image file size should not exceed 5MB',
            })
          }

          const fileExists = existingFiles.some(
            (existingFile) => existingFile.fileName === file.clientName
          )

          if (!fileExists) {
            newFiles.push(file)
          }
        }

        if (newFiles.length > 0) {
          const results = await FilesService.uploadFiles(newFiles)

          const uploadedFiles: any = []

          results.forEach(({ filename, url, metaData }) => {
            if (!url || !filename) return
            uploadedFiles.push({
              fileName: filename,
              fileUrl: url,
              fileType: metaData.type,
              propertyId: property.id,
              meta: JSON.stringify(metaData),
            })
          })

          if (uploadedFiles.length > 0) {
            for (const fileInfo of uploadedFiles) {
              await FilesService.createPropertyFile(fileInfo as PropertyFile)
            }
          }

          if (results.length > 0) {
            property.defaultImageUrl = results[0].url
          }
        }
      }

      const { files: _, ...restPayload } = payload
      await property.merge(restPayload).save()

      logger.info('Property updated successfully')
      return response.ok({
        success: true,
        message: 'Property updated successfully',
        data: property,
      })
    } catch (error) {
      logger.error(error)
      return response.badRequest(getErrorObject(error))
    }
  }

  async myProperties({ auth, response, request, logger }: HttpContext) {
    try {
      await auth.authenticate()
      const user = auth.user!

      const page = request.input('page', 1)
      const limit = request.input('limit', 10)

      const { status, categories, locations, pricing, search } = request.qs()

      const properties = await Property.query()
        .if(status, (query) => {
          query.where('status', status)
        })
        .if(search, (query) => {
          query.where('title', 'ilike', `%${search}%`)
        })
        .if(categories, (query) => {
          const parsedCategories = JSON.parse(categories)
          if (Array.isArray(parsedCategories)) {
            query.whereIn('categoryId', parsedCategories)
          }
        })
        .if(locations, (query) => {
          const parsedLocations = JSON.parse(locations)
          if (Array.isArray(parsedLocations)) {
            query.whereIn('stateId', parsedLocations)
          }
        })
        .if(pricing, (query) => {
          const parsedPricing = JSON.parse(pricing)
          // Check if pricing is an array
          const pricingArray = Array.isArray(parsedPricing) ? parsedPricing : [parsedPricing]

          // Process each pricing filter
          pricingArray.forEach((priceFilter) => {
            // Extract the numeric part and the operator (+ or -)
            const match = priceFilter.match(/(\d+)([+-])/)

            if (match) {
              const [, priceValue, operator] = match
              const price = parseInt(priceValue, 10)

              if (operator === '+') {
                // Price above the specified value
                query.where('price', '>=', price)
              } else if (operator === '-') {
                // Price below the specified value
                query.where('price', '<=', price)
              }
            }
          })
        })
        .where('userId', user.id)
        .preload('files')
        .orderBy('created_at', 'desc')
        .paginate(page, limit)

      logger.info('Properties fetched successfully')

      return response.ok({
        success: true,
        message: 'Properties fetched successfully',
        data: properties.toJSON(),
      })
    } catch (error) {
      response.badRequest(getErrorObject(error))
    }
  }

  async destroy({ logger, response, params }: HttpContext) {
    try {
      const property = await Property.findOrFail(params.id)
      await property.delete()
      logger.info('Property deleted successfully')
      return response.ok({
        success: true,
        message: 'Property deleted successfully',
      })
    } catch (error) {
      response.badRequest(getErrorObject(error))
    }
  }

  async updatePropertyStatus({ auth, logger, response, request, params }: HttpContext) {
    try {
      const user = await auth.authenticate()

      if (user.role !== 'admin') {
        logger.error(
          'PropertiesController.updatePropertyStatus - You are not authorized to perform this action'
        )
        return response.forbidden({
          success: false,
          message: 'You are not authorized to perform this action',
        })
      }
      const { status, reason } = await vine
        .compile(
          vine.object({
            status: vine.enum(['published', 'rejected']),
            reason: vine.string().optional().requiredWhen('status', '=', 'rejected'),
          })
        )
        .validate(request.body())

      const property = await Property.findOrFail(params.id)

      const propertyMeta = property.meta ? JSON.parse(property.meta) : {}

      await property
        .merge({
          status,
          meta: JSON.stringify({
            ...propertyMeta,
            rejectedReason: reason,
          }),
        })
        .save()

      logger.info('Property status updated successfully')
      return response.ok({
        success: true,
        message: 'Property status updated successfully',
        data: property,
      })
    } catch (error) {
      response.badRequest(getErrorObject(error))
    }
  }
}
