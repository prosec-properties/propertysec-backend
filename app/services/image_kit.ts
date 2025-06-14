import ImageKit from 'imagekit'
import env from '#start/env'
import logger from '@adonisjs/core/services/logger'
import { FileMetaData } from '../interfaces/file.js'
import { fileNameHash } from '#helpers/file'
import fs from 'fs'

export interface ImageUploadInterface {
  url: string
  filename: string
  metaData: FileMetaData
}

class ImageKitStorage {
  private client: ImageKit
  constructor() {
    this.client = new ImageKit({
      publicKey: env.get('IMAGEKIT_PUBLIC_KEY') || '',
      privateKey: env.get('IMAGEKIT_PRIVATE_KEY') || '',
      urlEndpoint: env.get('IMAGEKIT_URL_ENDPOINT') || '',
    })
  }

  public async uploadFile(file: Buffer | string, fileName: string): Promise<string> {
    try {
      const response = await this.client.upload({
        file: file,
        fileName: fileName,
        useUniqueFileName: false, // Keep original filename if needed
      })
      return response.url
    } catch (error) {
      logger.error({ error }, 'ImageKit upload failed')
      throw error
    }
  }

  public async uploadFromUrl(fileUrl: string, key: string): Promise<string> {
    const fileName = fileUrl.split('/').pop() || 'file'
    const hashedFileName = fileNameHash(fileName)

    return this.uploadFile(fileUrl, `${key}${hashedFileName}`)
  }

  public async ImageUpload(file: any): Promise<ImageUploadInterface> {
    const filename = fileNameHash(file.clientName)
    const fileData = fs.readFileSync(file.tmpPath)

    try {
      const url = await this.uploadFile(fileData, filename)
      return {
        url,
        filename,
        metaData: {
          clientName: file.clientName,
          name: file.name,
          size: file.size,
          type: file.type,
          lastModifiedDate: file.lastModifiedDate,
          lastModified: file.lastModified,
        },
      }
    } catch (error) {
      logger.error({ error }, 'ImageKit upload failed')
      throw error
    }
  }
}

export default new ImageKitStorage()
