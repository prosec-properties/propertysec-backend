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
    if (!env.get('IMAGEKIT_PUBLIC_KEY') || !env.get('IMAGEKIT_PRIVATE_KEY') || !env.get('IMAGEKIT_URL_ENDPOINT')) {
      throw new Error('ImageKit environment variables are not properly configured')
    }

    this.client = new ImageKit({
      publicKey: env.get('IMAGEKIT_PUBLIC_KEY') || '',
      privateKey: env.get('IMAGEKIT_PRIVATE_KEY') || '',
      urlEndpoint: env.get('IMAGEKIT_URL_ENDPOINT') || '',
    })
  }

  public async uploadFile(
    fileName: string, 
    data: Buffer | string, 
    contentType?: string
  ): Promise<{ url: string; fileId: string }> {
    try {
      const response = await this.client.upload({
        file: data,
        fileName: fileName,
        useUniqueFileName: false,
        folder: this.getFolderFromContentType(contentType),
      })
      
      logger.info(`File uploaded successfully to ImageKit: ${fileName}`)
      return {
        url: response.url,
        fileId: response.fileId
      }
    } catch (error) {
      logger.error({ error, fileName }, 'ImageKit upload failed')
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  private getFolderFromContentType(contentType?: string): string {
    if (!contentType) return 'misc'
    
    if (contentType.startsWith('image/')) return 'images'
    if (contentType.startsWith('video/')) return 'videos'
    if (contentType.startsWith('application/pdf')) return 'documents'
    return 'misc'
  }

  private getContentType(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase() || ''

    switch (extension) {
      case 'svg': return 'image/svg+xml'
      case 'png': return 'image/png'
      case 'jpeg':
      case 'jpg': return 'image/jpeg'
      case 'gif': return 'image/gif'
      case 'mp4': return 'video/mp4'
      case 'webm': return 'video/webm'
      case 'avi': return 'video/x-msvideo'
      case 'mpeg': return 'video/mpeg'
      case 'mov': return 'video/quicktime'
      case 'pdf': return 'application/pdf'
      default: return 'application/octet-stream'
    }
  }

  public async uploadFromUrl(fileUrl: string, key: string): Promise<{ url: string; fileId: string }> {
    try {
      const fileName = fileUrl.split('/').pop() || 'file'
      const hashedFileName = fileNameHash(fileName)
      const fullFileName = `${key}${hashedFileName}`
      const contentType = this.getContentType(fileName)

      const result = await this.client.upload({
        file: fileUrl,
        fileName: fullFileName,
        useUniqueFileName: false,
        folder: this.getFolderFromContentType(contentType),
      })
      
      logger.info(`File uploaded from URL successfully to ImageKit: ${fullFileName}`)
      return {
        url: result.url,
        fileId: result.fileId
      }
    } catch (error) {
      logger.error({ error, fileUrl }, 'Error uploading file from URL to ImageKit')
      throw new Error(`Failed to upload from URL: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  public async deleteFile(fileId: string): Promise<void> {
    try {
      await this.client.deleteFile(fileId)
      logger.info(`File deleted successfully from ImageKit: ${fileId}`)
    } catch (error) {
      logger.error({ error, fileId }, 'Error deleting file from ImageKit')
      throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  public async checkFileExists(fileName: string): Promise<{ exists: boolean; fileId?: string }> {
    try {
      const files = await this.client.listFiles({
        searchQuery: `name = "${fileName}"`,
        limit: 1
      })
      
      if (files.length > 0 && 'fileId' in files[0]) {
        return { exists: true, fileId: files[0].fileId }
      }
      return { exists: false }
    } catch (error) {
      logger.error({ error, fileName }, 'Error checking file existence in ImageKit')
      throw new Error(`Failed to check file existence: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  public async ImageUpload(file: any): Promise<ImageUploadInterface> {
    const filename = fileNameHash(file.clientName)
    const fileData = fs.readFileSync(file.tmpPath)
    const contentType = this.getContentType(file.clientName)

    try {
      const { url, fileId } = await this.uploadFile(filename, fileData, contentType)
      
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
          fileId // Store the fileId for future operations
        },
      }
    } catch (error) {
      logger.error({ 
        error, 
        filename,
        clientName: file.clientName,
        size: file.size
      }, 'Image upload failed')
      
      throw new Error(`Image upload failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}

export default new ImageKitStorage()