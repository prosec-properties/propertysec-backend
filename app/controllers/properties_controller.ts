import { getErrorObject } from '#helpers/error'
import Property from '#models/property'
import { createPropertyValidator, updatePropertyValidator } from '#validators/property'
import type { HttpContext } from '@adonisjs/core/http'
import FilesService from '#services/files'
import PropertyFile from '#models/property_file'
import { MultipartFile } from '@adonisjs/core/bodyparser'

export default class PropertiesController {
  async index({ response, logger }: HttpContext) {
    try {
      const properties = await Property.query().preload('files').orderBy('created_at', 'desc')

      logger.info('Properties fetched successfully')
      return response.ok({
        success: true,
        message: 'Properties fetched successfully',
        data: properties,
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
          })
        } catch (error) {
          // If property creation fails, return error
          return response.badRequest({
            success: false,
            message: 'Failed to create property',
          })
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

  async show({ logger, response, params }: HttpContext) {
    try {
      const property = await Property.query().where('id', params.id).preload('files').firstOrFail()
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

      if (payload?.files && Array.isArray(payload.files)) {
        payload.files.forEach((file: MultipartFile) => {
          if (file.type === 'image' && file.size > 5 * 1024 * 1024) {
            return response.badRequest({
              success: false,
              message: 'Image file size should not exceed 5mb',
            })
          }
        })

        const results = await FilesService.uploadFiles(payload.files)

        const uploadedFiles: any = []

        results.forEach(({ filename, url, metaData }) => {
          // console.log('metaData', metaData)
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

        property.defaultImageUrl = results[0].url
      }

      await property.merge(payload).save()

      logger.info('Property updated successfully')
      return response.ok({
        success: true,
        message: 'Property updated successfully',
        data: property,
      })
    } catch (error) {
      response.badRequest(getErrorObject(error))
    }
  }

  async myProperties({ auth, response, logger }: HttpContext) {
    try {
      await auth.authenticate()
      const user = auth.user!

      const properties = await Property.query().where('userId', user.id).preload('files')

      logger.info('Properties fetched successfully')

      return response.ok({
        success: true,
        message: 'Properties fetched successfully',
        data: properties,
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
}
