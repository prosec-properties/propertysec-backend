import PropertyFile from '#models/property_file'
import logger from '@adonisjs/core/services/logger'

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
}
