import env from '#start/env'
import logger from '@adonisjs/core/services/logger'
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3'
import axios from 'axios'
import { Readable } from 'stream'
import fs from 'fs'
import { FileMetaData } from '../interfaces/file.js'
import { fileNameHash } from '#helpers/file'

const BUCKET_NAME = env.get('AWS_BUCKET')

export interface ImageUploadInterface {
  url: string
  filename: string
  metaData: FileMetaData
}

console.log({
  accessKeyId: env.get('AWS_CLIENT_ACCESS_KEY'),
  secretAccessKey: env.get('AWS_SECRET_ACCESS_KEY'),
  region: env.get('AWS_REGION'),
  bucket: env.get('AWS_BUCKET'),
})

class AWS {
  private client: S3Client
  constructor() {
    this.client = new S3Client({
      region: 'auto',
      endpoint: env.get('R2_ENDPOINT') || '',
      credentials: {
        accessKeyId: env.get('R2_ACCESS_KEY_ID') || '',
        secretAccessKey: env.get('R2_SECRET_ACCESS_KEY') || '',
      },
      forcePathStyle: true, // Required for R2 compatibility
    })
  }

  private getContentType(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase() || ''

    switch (extension) {
      case 'svg':
        return 'image/svg+xml'
      case 'png':
        return 'image/png'
      case 'jpeg':
      case 'jpg':
        return 'image/jpeg'
      case 'gif':
        return 'image/gif'
      case 'mp4':
        return 'video/mp4'
      case 'webm':
        return 'video/webm'
      case 'avi':
        return 'video/x-msvideo'
      case 'mpeg':
        return 'video/mpeg'
      case 'mov':
        return 'video/quicktime'
      default:
        return 'application/octet-stream'
    }
  }

  public async uploadFile(
    fileName: string,
    data: Buffer | Readable,
    contentType: string
  ): Promise<string> {
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: data,
      ContentType: contentType,
    }

    try {
      const command = new PutObjectCommand(uploadParams)
      await this.client.send(command)
      logger.info(`File uploaded successfully: ${fileName}`)
      // return `https://${BUCKET_NAME}.s3.amazonaws.com/${fileName}`
      return `https://dc27b5589db2bd071b61f02c1a6aad39.r2.cloudflarestorage.com/prosec-bucket/${fileName}`
    } catch (error) {
      logger.error({ error }, 'Error uploading file to AWS S3')
      throw error
    }
  }

  public async uploadFromUrl(fileUrl: string, key: string): Promise<string> {
    try {
      const response = await axios.get(fileUrl, { responseType: 'arraybuffer' })
      const fileName = fileUrl.split('/').pop() || 'file'
      const hashedFileName = fileNameHash(fileName)

      await this.uploadFile(
        `${key}${hashedFileName}`,
        Buffer.from(response.data),
        this.getContentType(fileName)
      )
      return hashedFileName
    } catch (error) {
      logger.error({ error }, 'Error uploading file from URL to AWS S3')
      throw error
    }
  }

  public async deleteFile(fileName: string): Promise<void> {
    const deleteParams = {
      Bucket: BUCKET_NAME,
      Key: fileName,
    }

    try {
      const command = new DeleteObjectCommand(deleteParams)
      await this.client.send(command)
      logger.info(`File deleted successfully: ${fileName}`)
    } catch (error) {
      logger.error({ error }, 'Error deleting file from AWS S3')
      throw error
    }
  }

  public async downloadFile(fileName: string): Promise<Readable> {
    const downloadParams = {
      Bucket: BUCKET_NAME,
      Key: fileName,
    }

    try {
      const command = new GetObjectCommand(downloadParams)
      const response = await this.client.send(command)
      return response.Body as Readable
    } catch (error) {
      logger.error({ error }, 'Error downloading file from AWS S3')
      throw error
    }
  }

  public async checkFileExists(key: string): Promise<boolean> {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
    }

    try {
      const command = new HeadObjectCommand(params)
      await this.client.send(command)
      return true
    } catch (error: any) {
      if (error.name === 'NotFound') {
        return false
      }
      logger.error({ error }, 'Error checking file existence in AWS S3')
      throw error
    }
  }

  public async ImageUpload(file: any): Promise<ImageUploadInterface> {
    const filename = fileNameHash(file.clientName)
    const fileData = fs.readFileSync(file.tmpPath)

    try {
      const url = await this.uploadFile(filename, fileData, this.getContentType(file.clientName))
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

export default new AWS()
