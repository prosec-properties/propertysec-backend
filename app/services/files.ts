import ProfileFile from '#models/profile_file'
import PropertyFile from '#models/property_file'
import logger from '@adonisjs/core/services/logger'
import aws, { ImageUploadInterface } from './aws.js'
import { FileData } from '#interfaces/file'
import ProductFile from '#models/product_file'

export default class FilesService {
  static async createPropertyFile({ fileType, fileUrl, propertyId, meta, fileName }: PropertyFile) {
    console.log('Yayy file created')
    try {
      await PropertyFile.create({
        fileUrl,
        fileName,
        fileType,
        propertyId,

        meta,
      })
      logger.info('File created successfully: %s')
    } catch (error) {
      throw error
    }
  }

  static async createProductFile({ fileType, fileUrl, productId, meta, fileName }: ProductFile) {
    console.log('Creating product file')

    try {
      const gg = await ProductFile.create({
        fileUrl,
        fileType,
        productId,
        fileName,
        meta,
      })

      console.log('gg', gg)
      logger.info('File created successfully: %s')
    } catch (error) {
      throw error
    }
  }

  static async deletePropertyFile(fileId: string) {
    try {
      const file = await PropertyFile.findOrFail(fileId)
      await aws.deleteFile(file.fileName)
      await file.delete()

      logger.info('File deleted successfully: %s')
    } catch (error) {
      throw error
    }
  }

  static async deleteProductFile(fileId: string) {
    try {
      const file = await ProductFile.findOrFail(fileId)
      await aws.deleteFile(file.fileName)
      await file.delete()

      logger.info('File deleted successfully: %s')
    } catch (error) {
      throw error
    }
  }

  static async createProfileFile({
    fileCategory,
    fileType,
    fileUrl,
    userId,
    meta,
    fileName,
  }: ProfileFile) {
    try {
      await ProfileFile.create({
        fileUrl,
        fileCategory,
        fileName,
        fileType,
        userId,
        meta,
      })
      logger.info('File created successfully: %s')
    } catch (error) {
      throw error
    }
  }

  static async deleteProfileFile(fileId: string) {
    try {
      const file = await ProfileFile.findOrFail(fileId)
      await file.delete()
      logger.info('File deleted successfully: %s')
    } catch (error) {
      throw error
    }
  }

  static async uploadFiles(files: any): Promise<ImageUploadInterface[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const filesToUpload: FileData[] = Array.isArray(files)
          ? files.filter((file) => file.tmpPath)
          : files.tmpPath
            ? [files]
            : []
        const uploadPromises = filesToUpload.map((file) =>
          aws.ImageUpload(file).catch((e): ImageUploadInterface => {
            console.error(file, 'Failed to upload file: %s', e.message)
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

  static async getUploadedFilesData(files: any, itemId: string) {
    const uploadedFiles: any = []
    try {
      const results = await FilesService.uploadFiles(files)

      results.forEach(({ filename, url, metaData }) => {
        // console.log('metaData', metaData)
        if (!url || !filename) return
        uploadedFiles.push({
          fileName: filename,
          fileUrl: url,
          fileType: metaData.type,
          itemId: itemId,
          meta: JSON.stringify(metaData),
        })
      })

      return uploadedFiles
    } catch (error) {
      throw error
    }
  }
}
