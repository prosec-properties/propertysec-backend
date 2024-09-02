import { getErrorObject } from '#helpers/error'
import Property from '#models/property'
import azure, { ImageUploadInterface } from '#services/azure'
import { createPropertyValidator } from '#validators/property'
import type { HttpContext } from '@adonisjs/core/http'
import { FileData } from '../interfaces/file.js'
import { Logger } from '@adonisjs/core/logger'
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
      return getErrorObject(error)
    }
  }

  async store({ auth, request, response, logger }: HttpContext) {
    try {
      await auth.authenticate()

      const user = auth.user!

      const { files, ...payload } = await request.validateUsing(createPropertyValidator)
      const uploadedFiles: any = []

      if (files && Array.isArray(files)) {
        files.forEach((file: MultipartFile) => {
          if (file.type === 'image' && file.size > 5 * 1024 * 1024) {
            return response.badRequest({
              success: false,
              message: 'Image file size should not exceed 5mb',
            })
          }
        })
        const results = await PropertiesController.savedPropertyFiles(files, logger)

        const property = await Property.create({
          ...payload,
          status: 'pending',
          userId: user.id,
          categoryId: '74f1bfa3-a940-41b2-a9aa-e34f352ba7e3',
        })

        if (!property) {
          return response.badRequest({
            success: false,
            message: 'Failed to create property',
          })
        }

        results.forEach(({ filename, url, metaData }) => {
          console.log('metaData', metaData)
          if (!url || !filename) return
          uploadedFiles.push({
            fileName: filename,
            fileUrl: url,
            fileType: metaData.type,
            propertyId: property.id,
            meta: JSON.stringify(metaData),
          })
        })

        property.defaultImageUrl = results[0].url
        await property.save()
      }

      // fileInfo {
      //   userId: '757a5989-03dc-43e9-aab5-accc9412129a',
      //   fileName: 'pro_sec_5e8230fd9f06f1e2a4a6e2cacc34aa5d22db8db31429ab0f03803a3083e9f155.jpg',
      //   url: 'https://prosecblob.blob.core.windows.net/prosec-container/pro_sec_5e8230fd9f06f1e2a4a6e2cacc34aa5d22db8db31429ab0f03803a3083e9f155.jpg',
      //   type: 'PRODUCT_PICTURE',
      //   propertyId: '5181f897-4606-4dd9-a8b9-05749607315c',
      //   metaData: {
      //     clientName: 'chrome stuff.jpg',
      //     name: undefined,
      //     size: 80638,
      //     type: 'image',
      //     lastModifiedDate: undefined,
      //     lastModified: undefined
      //   }
      // }
      if (uploadedFiles.length > 0) {
        for (const fileInfo of uploadedFiles) {
          await FilesService.createPropertyFile(fileInfo as PropertyFile)
        }
      }

      // return
      console.log('files', files)
      logger.info('Property created successfully')

      return response.created({
        success: true,
        message: 'Property created successfully',
        // data: property,
      })
    } catch (error) {
      console.error(error)
      return getErrorObject(error)
    }
  }

  public static async savedPropertyFiles(
    files: any,
    logger: Logger
  ): Promise<ImageUploadInterface[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const filesToUpload: FileData[] = Array.isArray(files)
          ? files.filter((file) => file.tmpPath)
          : files.tmpPath
            ? [files]
            : []
        const uploadPromises = filesToUpload.map((file) =>
          azure.ImageUpload(file).catch((e): ImageUploadInterface => {
            logger.error(file, 'Failed to upload file: %s', e.message)
            return {
              filename: '',
              url: '',
              metaData: {
                clientName: '',
                name: '',
                type: '',
                lastModified: '',
                size: 0,
                lastModifiedDate: '',
              },
            }
          })
        )
        const results = await Promise.all(uploadPromises)
        resolve(results)
      } catch (error) {
        reject(error)
      }
    })
  }
}
