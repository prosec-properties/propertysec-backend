import { getErrorObject } from '#helpers/error'
import Property from '#models/property'
import { createPropertyValidator, updatePropertyValidator } from '#validators/property'
import type { HttpContext } from '@adonisjs/core/http'
import FilesService from '#services/files'
import PropertyFile from '#models/property_file'
import { MultipartFile } from '@adonisjs/core/bodyparser'
import { NIGERIA_COUNTRY_ID } from '#constants/general'

export default class PropertiesController {
  async index({ response, request, logger }: HttpContext) {
    try {
      const page = request.input('page', 1)
      const limit = request.input('limit', 20)

      const properties = await Property.query()
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

  // async index({ response, request, logger }: HttpContext) {
  //   try {
  //     const page = request.input('page', 1)
  //     const limit = request.input('limit', 20)
  //     const categories = request.input('categories', '').split(',').filter(Boolean)
  //     const locations = request.input('locations', '').split(',').filter(Boolean)
  //     const pricing = request.input('pricing', '').split(',').filter(Boolean)

  //     console.log('pricing', pricing)

  //     const query = Property.query()
  //       .preload('files')
  //       .orderBy('created_at', 'desc')

  //     // Apply category filter if provided
  //     if (categories.length > 0) {
  //       query.whereIn('category_id', categories)
  //     }

  //     // Apply location filter if provided
  //     if (locations.length > 0) {
  //       query.whereIn('state_id', locations)
  //     }

  //     // Apply pricing filter if provided
  //     if (pricing.length > 0) {
  //       pricing.forEach((priceId: string) => {
  //         switch (priceId) {
  //           case '11': // Under ₦100,000
  //             query.where('price', '<', 100000)
  //             break
  //           case '12': // Under ₦150,000
  //             query.where('price', '<', 150000)
  //             break
  //           case '13': // Under ₦200,000
  //             query.where('price', '<', 200000)
  //             break
  //           case '14': // Over ₦200,000
  //             query.where('price', '>', 200000)
  //             break
  //         }
  //       })
  //     }

  //     const properties = await query.paginate(page, limit)

  //     logger.info('Properties fetched successfully')
  //     return response.ok({
  //       success: true,
  //       message: 'Properties fetched successfully',
  //       data: properties.toJSON(),
  //     })
  //   } catch (error) {
  //     console.error(error)
  //     return response.badRequest(getErrorObject(error))
  //   }
  // }

  async store({ auth, request, response, logger }: HttpContext) {
    try {
      await auth.authenticate()
      const user = auth.user!
      const { files, ...payload } = await request.validateUsing(createPropertyValidator)

      if (files && Array.isArray(files)) {
        // Validate file sizes
        files.forEach((file: MultipartFile) => {
          if (file.type === 'image' && file.size > 5 * 1024 * 1024) {
            return response.badRequest({
              success: false,
              message: 'Image file size should not exceed 5mb',
            })
          }
        })

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
            status: 'pending',
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
            // If file saving fails, delete the property and return error
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
      const property = await Property.query().where('id', params.id).preload('files').firstOrFail()

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

  async update({ logger, response, request, params }: HttpContext) {
    try {
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
          if (file.type?.startsWith('image/') && file.size > 5 * 1024 * 1024) {
            return response.badRequest({
              success: false,
              message: 'Image file size should not exceed 5MB',
            })
          }

          // Validate file size for videos
          if (file.type?.startsWith('video/') && file.size > 10 * 1024 * 1024) {
            return response.badRequest({
              success: false,
              message: 'Video file size should not exceed 10MB',
            })
          }

          // Check if the file already exists
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

          const uploadedFiles: any = []

          results.forEach(({ filename, url, metaData }) => {
            if (!url || !filename) return
            console.log('metaData', metaData)
            uploadedFiles.push({
              fileName: filename,
              fileUrl: url,
              fileType: metaData.type,
              propertyId: property.id,
              meta: JSON.stringify(metaData),
            })
          })

          // Save new files to the database
          if (uploadedFiles.length > 0) {
            for (const fileInfo of uploadedFiles) {
              await FilesService.createPropertyFile(fileInfo as PropertyFile)
            }
          }

          // Set the default image URL if new files were uploaded
          if (results.length > 0) {
            property.defaultImageUrl = results[0].url
          }
        }
      }

      // Update the property with the payload (excluding files)
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

      const properties = await Property.query()
        .where('userId', user.id)
        .preload('files')
        .orderBy('created_at', 'desc')
        .paginate(page, limit)

      logger.info('Properties fetched successfully')
      // console.log('properties', properties.toJSON())

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

  // async search({ response, request, logger }: HttpContext) {
  //   try {
  //     const page = request.input('page', 1)
  //     const limit = request.input('limit', 20)
  //     const categories = request.input('categories', '').split(',').filter(Boolean)
  //     const locations = request.input('locations', '').split(',').filter(Boolean)
  //     const price = request.input('price', '').split(',').filter(Boolean)

  //     const query = Property.query()
  //       .preload('files')
  //       .where('status', 'published') // Only show published properties
  //       .orderBy('created_at', 'desc')

  //     // Apply filters
  //     if (categories.length) query.whereIn('category_id', categories)
  //     if (locations.length) query.whereIn('state_id', locations)

  //     if (price.length) {
  //       const priceConditions = price.map((priceId: any) => {
  //         switch (priceId) {
  //           case '11': return ['price', '<', 100000]
  //           case '12': return ['price', '<', 150000]
  //           case '13': return ['price', '<', 200000]
  //           case '14': return ['price', '>', 200000]
  //           default: return null
  //         }
  //       }).filter(Boolean)

  //       if (priceConditions.length) {
  //         query.where(q => {
  //           priceConditions.forEach(cond => {
  //             q.orWhere(...cond)
  //           })
  //         })
  //       }
  //     }

  //     const properties = await query.paginate(page, limit)

  //     logger.info('Filtered properties fetched successfully')
  //     return response.ok({
  //       success: true,
  //       message: 'Filtered properties fetched successfully',
  //       data: properties.toJSON(),
  //     })
  //   } catch (error) {
  //     logger.error(error)
  //     return response.badRequest(getErrorObject(error))
  //   }
  // }
}
