import ProfileFile from '#models/profile_file'
import PropertyFile from '#models/property_file'
import logger from '@adonisjs/core/services/logger'
import azure from './azure.js'

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

  static async deletePropertyFile(fileId: string) {
    try {
      const file = await PropertyFile.findOrFail(fileId)
      await azure.deleteFile(file.fileName)
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
}
