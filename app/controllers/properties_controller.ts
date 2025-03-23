import { getErrorObject } from '#helpers/error'
import Property from '#models/property'
import { createPropertyValidator, updatePropertyValidator } from '#validators/property'
import type { HttpContext } from '@adonisjs/core/http'
import FilesService from '#services/files'
import PropertyFile from '#models/property_file'
import { MultipartFile } from '@adonisjs/core/bodyparser'

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
            data: property,
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

  // async update({ logger, response, request, params }: HttpContext) {
  //   try {
  //     const property = await Property.findOrFail(params.id)
  //     const payload = await request.validateUsing(updatePropertyValidator)
  //     if (!payload) {
  //       return response.badRequest({
  //         success: false,
  //         message: 'Invalid payload',
  //       })
  //     }

  //     if (payload?.files && Array.isArray(payload.files)) {
  //       payload.files.forEach((file: MultipartFile) => {
  //         if (file.type === 'image' && file.size > 5 * 1024 * 1024) {
  //           return response.badRequest({
  //             success: false,
  //             message: 'Image file size should not exceed 5mb',
  //           })
  //         }
  //       })

  //       const results = await FilesService.uploadFiles(payload.files)

  //       const uploadedFiles: any = []

  //       results.forEach(({ filename, url, metaData }) => {
  //         // console.log('metaData', metaData)
  //         if (!url || !filename) return
  //         uploadedFiles.push({
  //           fileName: filename,
  //           fileUrl: url,
  //           fileType: metaData.type,
  //           propertyId: property.id,
  //           meta: JSON.stringify(metaData),
  //         })
  //       })

  //       if (uploadedFiles.length > 0) {
  //         for (const fileInfo of uploadedFiles) {
  //           await FilesService.createPropertyFile(fileInfo as PropertyFile)
  //         }
  //       }

  //       property.defaultImageUrl = results[0].url
  //     }

  //     await property.merge(payload).save()

  //     logger.info('Property updated successfully')
  //     return response.ok({
  //       success: true,
  //       message: 'Property updated successfully',
  //       data: property,
  //     })
  //   } catch (error) {
  //     response.badRequest(getErrorObject(error))
  //   }
  // }

  async update({ logger, response, request, params }: HttpContext) {
    try {
      const property = await Property.findOrFail(params.id);
      const payload = await request.validateUsing(updatePropertyValidator);
      
      if (!payload) {
        return response.badRequest({
          success: false,
          message: 'Invalid payload',
        });
      }
  
      const existingFiles = await property.related('files').query();
  
      // Array to store new files to be uploaded
      const newFiles: MultipartFile[] = [];

      // console.log('existingFiles', existingFiles)
      // console.log('payload.files', payload?.files)
      // return
      // Check if files are provided in the payload
      if (payload.files && Array.isArray(payload.files)) {
        // Validate and process each incoming file
        for (const file of payload.files) {
          // Validate file size for images
          if (file.type?.startsWith('image/') && file.size > 5 * 1024 * 1024) {
            return response.badRequest({
              success: false,
              message: 'Image file size should not exceed 5MB',
            });
          }
  
          // Validate file size for videos
          if (file.type?.startsWith('video/') && file.size > 10 * 1024 * 1024) {
            return response.badRequest({
              success: false,
              message: 'Video file size should not exceed 10MB',
            });
          }
  
          // Check if the file already exists
          const fileExists = existingFiles.some(
            (existingFile) => existingFile.fileName === file.clientName
          );
  
          // If the file does not exist, add it to the newFiles array
          if (!fileExists) {
            newFiles.push(file);
          }
        }
  
        // Upload only new files
        if (newFiles.length > 0) {
          const results = await FilesService.uploadFiles(newFiles);
  
          const uploadedFiles: any = [];
  
          results.forEach(({ filename, url, metaData }) => {
            if (!url || !filename) return;
            uploadedFiles.push({
              fileName: filename,
              fileUrl: url,
              fileType: metaData.type,
              propertyId: property.id,
              meta: JSON.stringify(metaData),
            });
          });
  
          // Save new files to the database
          if (uploadedFiles.length > 0) {
            for (const fileInfo of uploadedFiles) {
              await FilesService.createPropertyFile(fileInfo as PropertyFile);
            }
          }
  
          // Set the default image URL if new files were uploaded
          if (results.length > 0) {
            property.defaultImageUrl = results[0].url;
          }
        }
      }
  
      // Update the property with the payload (excluding files)
      const { files: _, ...restPayload } = payload;
      await property.merge(restPayload).save();
  
      logger.info('Property updated successfully');
      return response.ok({
        success: true,
        message: 'Property updated successfully',
        data: property,
      });
    } catch (error) {
      logger.error(error);
      return response.badRequest(getErrorObject(error));
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
}
