import { getErrorObject } from '#helpers/error'
import User from '#models/user'
import FilesService from '#services/files'
import ProfileFile from '#models/profile_file'
import { updateProfileValidator } from '#validators/user_profile'
import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'

export default class UsersController {
  async me({ auth, response, logger }: HttpContext) {
    try {
      await auth.check()
      const user = await User.query()
        .where('id', auth.user!.id)
        .preload('properties')
        .preload('propertyAccessRequests')
        .preload('profileFiles')
        .first()

      return response.ok({
        success: true,
        message: 'User data fetched successfully',
        data: user,
      })
    } catch (error) {
      logger.error(error)
      return response.badRequest({
        success: false,
        message: 'Failed to fetch user data',
      })
    }
  }

  async updateProfile({ auth, request, response, logger }: HttpContext) {
    try {
      await auth.authenticate()
      const user = auth.user!

      const payload = await request.validateUsing(updateProfileValidator)

      if (payload.password && payload.oldPassword) {
        await this.verifyAndUpdatePassword(user, payload.oldPassword, payload.password)
      }

      const updatedUser = await this.updateUserInfo(user, payload)

      await this.handleFileUploads(payload, user.id)

      await updatedUser.load('profileFiles')

      logger.info(`Profile updated for user ${user.id}`)

      return response.ok({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser,
      })
    } catch (error) {
      logger.error(error)
      return response.badRequest(
        getErrorObject(error, {
          controller: 'UsersController.updateProfile',
        })
      )
    }
  }

  private async verifyAndUpdatePassword(user: User, oldPassword: string, newPassword: string) {
    const isPasswordValid = await hash.verify(user.password, oldPassword)
    if (!isPasswordValid) {
      throw new Error('Old password is incorrect')
    }
    user.password = newPassword
  }

  private async updateUserInfo(user: User, payload: any) {
    const updatableFields = {
      fullName: payload.fullName,
      phoneNumber: payload.phoneNumber,
      businessName: payload.businessName,
      businessRegNo: payload.businessRegNo,
      businessAddress: payload.businessAddress,
      nationality: payload.nationality,
      stateOfResidence: payload.stateOfResidence,
      cityOfResidence: payload.cityOfResidence,
      homeAddress: payload.homeAddress,
      stateOfOrigin: payload.stateOfOrigin,
      nin: payload.nin,
      bvn: payload.bvn,
      nextOfKin: payload.nextOfKin,
      religion: payload.religion,
      monthlySalary: payload.monthlySalary,
      bankName: payload.bankName,
      bankAccountNumber: payload.bankAccountNumber,
      bankAccountName: payload.bankAccountName,
      meta: payload.meta ? JSON.stringify(payload.meta) : null,
    }

    return await user.merge(updatableFields).save()
  }

  private async handleFileUploads(payload: any, userId: string) {
    const fileCategories = {
      avatarUrl: 'avatar',
      approvalAgreement: 'approval_agreement',
      identificationCard: 'identification',
      powerOfAttorney: 'power_of_attorney',
    }

    for (const [field, category] of Object.entries(fileCategories)) {
      if (payload[field]) {
        const files = Array.isArray(payload[field]) ? payload[field] : [payload[field]]

        for (const file of files) {
          if (file.size > 10 * 1024 * 1024) {
            throw new Error(`File ${file.clientName} exceeds maximum size of 10MB`)
          }
        }

        const results = await FilesService.uploadFiles(files)

        if (!results.length) {
          throw new Error(`Failed to upload ${category} files`)
        }

        const uploadedFiles = results.map(({ filename, url, metaData }) => ({
          fileName: filename,
          fileUrl: url,
          fileType: metaData.type,
          userId,
          fileCategory: category,
          meta: JSON.stringify(metaData),
        }))

        await Promise.all(
          uploadedFiles.map((fileInfo) => FilesService.createProfileFile(fileInfo as ProfileFile))
        )
      }
    }
  }

  async deleteFile({ params, response, logger, auth }: HttpContext) {
    try {
      await auth.authenticate()
      const user = auth.user!

      const { id } = params
      await FilesService.deleteProfileFile(id)

      return response.ok({
        success: true,
        message: 'File deleted successfully',
        data: user,
      })
    } catch (error) {
      logger.error(error)
      return response.badRequest(getErrorObject(error))
    }
  }
}
