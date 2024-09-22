import { getErrorObject } from '#helpers/error'
import { FileData } from '#interfaces/file'
import User from '#models/user'
import azure, { ImageUploadInterface } from '#services/azure'
import FilesService from '#services/files'
import { updateProfileValidator } from '#validators/user_profile'
import type { HttpContext } from '@adonisjs/core/http'
import { Logger } from '@adonisjs/core/logger'
import hash from '@adonisjs/core/services/hash'

export default class UsersController {
  async me({ auth, response }: HttpContext) {
    try {
      await auth.check()
      const user = await User.query()
        .where('id', auth.user!.id)
        .preload('properties')
        .preload('propertyAccessRequests')
        .preload('profileFiles')
        .first()

      response.ok(user)
    } catch (error) {
      console.error(error.message)
      response.badRequest('An error occurred while fetching the user data.')
    }
  }

  async updateProfile({ auth, request, response, logger }: HttpContext) {
    try {
      await auth.authenticate()
      const user = auth.user!
      const payload = await request.validateUsing(updateProfileValidator)

      await this.updatePasswordIfNeeded(payload, user, response)

      const userInfo = this.extractUserInfo(payload)
      const uploadedFiles = await this.uploadFiles(payload, user.id, logger)

      await user.merge(userInfo)
      await user.save()

      if (uploadedFiles.length > 0) {
        for (const uploadedFile of uploadedFiles) {
          await FilesService.createProfileFile(uploadedFile)
        }
      }

      logger.info('Profile updated successfully from UsersController.updateProfile')

      response.ok({
        success: true,
        message: 'Profile updated successfully',
      })
    } catch (error) {
      console.error(error.message)
      response.badRequest(
        getErrorObject(error, {
          controller: 'UsersController.updateProfile',
        })
      )
    }
  }

  private async updatePasswordIfNeeded(
    payload: any,
    user: User,
    response: HttpContext['response']
  ) {
    if (payload?.oldPassword && payload?.newPassword) {
      const isPasswordValid = await hash.verify(user.password, payload.oldPassword)
      if (!isPasswordValid) {
        response.badRequest({
          success: false,
          message: 'Old password is incorrect',
        })
        throw new Error('Old password is incorrect')
      }
      user.password = payload.newPassword
    }
  }

  private extractUserInfo(payload: any) {
    return {
      fullName: payload?.fullName,
      phoneNumber: payload?.phoneNumber,
      homeAddress: payload?.homeAddress,
      password: payload?.newPassword,
      avatarUrl: payload?.avatarUrl,
      businessName: payload?.businessName,
      businessRegNo: payload?.businessRegNo,
      businessAddress: payload?.businessAddress,
      nationality: payload?.nationality,
      stateOfResidence: payload?.stateOfResidence,
      cityOfResidence: payload?.cityOfResidence,
      stateOfOrigin: payload?.stateOfOrigin,
      nin: payload?.nin,
      bvn: payload?.bvn,
      nextOfKin: payload?.nextOfKin,
      religion: payload?.religion,
      monthlySalary: payload?.monthlySalary,
      bankName: payload?.bankName,
      bankAccountNumber: payload?.bankAccountNumber,
      bankAccountName: payload?.bankAccountName,
    }
  }

  private async uploadFiles(payload: any, userId: string, logger: Logger) {
    const fileMappings: { [key: string]: string } = {
      approvalAgreement: 'approval_agreement',
      identificationCard: 'identification',
      powerOfAttorney: 'power_of_attorney',
    }

    const uploadedFiles: any[] = []

    for (const [key, category] of Object.entries(fileMappings)) {
      if (payload[key]) {
        const results = await this.savedFiles(payload[key], logger)
        results.forEach(({ filename, url, metaData }) => {
          if (url && filename) {
            uploadedFiles.push({
              fileName: filename,
              fileUrl: url,
              fileType: metaData.type,
              userId,
              fileCategory: category,
              meta: JSON.stringify(metaData),
            })
          }
        })
      }
    }

    return uploadedFiles
  }

  async savedFiles(files: any, logger: Logger): Promise<ImageUploadInterface[]> {
    const filesToUpload: FileData[] = Array.isArray(files)
      ? files.filter((file) => file.tmpPath)
      : files.tmpPath
        ? [files]
        : []

    const uploadPromises = filesToUpload.map((file) =>
      azure.ImageUpload(file).catch((e): ImageUploadInterface => {
        logger.error(`Failed to upload file: ${e.message}`, file)
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

    return await Promise.all(uploadPromises)
  }

  async deleteFile({ params, response }: HttpContext) {
    try {
      const { id } = params
      await FilesService.deleteProfileFile(id)
      response.ok({
        success: true,
        message: 'File deleted successfully',
      })
    } catch (error) {
      console.error(error)
      response.badRequest('An error occurred while deleting the file')
    }
  }
}
