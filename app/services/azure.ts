import env from '#start/env'
import logger from '@adonisjs/core/services/logger'
import { Readable } from 'stream'
import fs from 'fs'
import { BlobServiceClient } from '@azure/storage-blob'
import { FileMetaData } from '../interfaces/file.js'
import { fileNameHash } from '#helpers/file'

export interface ImageUploadInterface {
  url: string
  filename: string
  metaData: FileMetaData
}

class Azure {
  private client: BlobServiceClient

  constructor() {
    this.client = BlobServiceClient.fromConnectionString(
      env.get('AZURE_STORAGE_CONNECTION_STRING') as string
    )
  }

  public async uploadFile(fileName: string, stream: fs.ReadStream | Readable) {
    const containerClient = this.client.getContainerClient('prosec-container')
    const blockBlobClient = containerClient.getBlockBlobClient(fileName)
    try {
      // Upload data to the blob
      await blockBlobClient.uploadStream(stream, 4 * 1024 * 1024, 20, {
        onProgress: (ev) => logger.info({ ev }, 'Upload progress'),
      })
      // Get the URL of the uploaded blob
      return blockBlobClient.url
    } catch (error) {
      // Handle any upload errors here
      logger.error(
        { error: error.message || error.response || error },
        'Error uploading file to Azure Blob Storage'
      )
      throw error
    }
  }

  public async deleteFile(fileName: string) {
    const containerClient = this.client.getContainerClient('prosec-container')
    const blockBlobClient = containerClient.getBlockBlobClient(fileName)
    try {
      // Delete blob
      await blockBlobClient.delete()
    } catch (error) {
      // Handle any errors
      logger.error({ error }, 'Error deleting file from Azure Blob Storage')
      throw error
    }
  }

  public async downloadFile(fileName: string) {
    const containerClient = this.client.getContainerClient('prosec-container')
    const blockBlobClient = containerClient.getBlockBlobClient(fileName)
    try {
      // Download blob
      const downloadBlockBlobResponse = await blockBlobClient.download(0)
      return downloadBlockBlobResponse.readableStreamBody as Readable
    } catch (error) {
      // Handle any errors
      logger.error({ error }, 'Error downloading file from Azure Blob Storage')
      throw error
    }
  }

  public async ImageUpload(file: any): Promise<ImageUploadInterface> {
    const filename = fileNameHash(file.clientName)
    const stream: fs.ReadStream | Readable = fs.createReadStream(file.tmpPath)
    try {
      const url = await this.uploadFile(filename, stream)
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
      logger.error(
        { error, message: 'could not process upload data' },
        'could not process upload data'
      )
      throw error
    }
  }
}

export default new Azure()
