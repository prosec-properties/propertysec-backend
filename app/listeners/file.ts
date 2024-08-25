import PropertyFile from '#models/property_file'
import logger from '@adonisjs/core/services/logger'

export default class FileListener {
  async handle({ fileType, fileUrl, propertyId, meta }: PropertyFile) {
    console.log('Yayy file created')
    try {
      await PropertyFile.create({
        fileUrl,
        fileType,
        propertyId,
        meta,
      })
      logger.info('File created successfully: %s')
    } catch (error) {
      throw error
    }
  }

  // public async onUpdate({ url, oldUrl, fileName, oldFileName }: EventsList['upload:update']) {
  //   try {
  //     let file: File | null = null

  //     if (oldUrl) {
  //       file = await File.findByOrFail('url', oldUrl)
  //     }

  //     if (oldFileName) {
  //       file = await File.findByOrFail('fileName', oldFileName)
  //     }
  //     await file?.merge({ url, fileName }).save()
  //     Logger.info(
  //       'File updated successfully: %s',
  //       fileName || url + ' from ' + oldFileName || oldUrl
  //     )
  //   } catch (error) {
  //     throw error
  //   }
  // }

  // public async onDelete({ id }: EventsList['upload:delete']) {
  //   try {
  //     const file = await File.findOrFail(id)
  //     const { fileName, url } = file
  //     await Azure.deleteFile(fileName)

  //     await file.delete()
  //     Logger.info('File deleted successfully: %s', fileName || url)
  //   } catch (error) {
  //     throw error
  //   }
  // }
}
