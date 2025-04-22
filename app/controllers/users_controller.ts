import { getErrorObject } from '#helpers/error'
import User from '#models/user'
import FilesService from '#services/files'
import ProfileFile from '#models/profile_file'
import { updateProfileValidator } from '#validators/user_profile'
import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import { FILE_CATEGORY_ENUM } from '#interfaces/file'
import db from '@adonisjs/lucid/services/db'

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
      approvalAgreement: FILE_CATEGORY_ENUM.APPROVAL_AGREEMENT,
      identificationCard: FILE_CATEGORY_ENUM.ID_CARD,
      powerOfAttorney: FILE_CATEGORY_ENUM.POWER_OF_ATTORNEY,
      profileImage: FILE_CATEGORY_ENUM.PROFILE_IMAGE,
      passport: FILE_CATEGORY_ENUM.PASSPORT,
    } as const

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
      await user.load('profileFiles')

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

  public async fetchAllUsers({ auth, response, request, bouncer }: HttpContext) {
    try {
      await auth.authenticate()
      await bouncer.with('UserPolicy').authorize('isAdmin')

      const page = Number(request.input('page', 1))
      const perPage = Number(request.input('per_page', 20))
      const sortBy = request.input('sort_by', 'created_at')
      const order = request.input('order', 'desc')

      const orderDirection = order.toLowerCase() === 'asc' ? 'asc' : 'desc'

      const sortableColumns = ['created_at', 'updated_at', 'email', 'first_name', 'last_name']
      const validSortBy = sortableColumns.includes(sortBy) ? sortBy : 'created_at'

      const users = await User.query()
        .preload('profileFiles')
        .orderBy(validSortBy, orderDirection)
        .paginate(page, perPage)

      const totalUsersCount = await db.from('users').count('* as total').first()

      const activeUsersCount = await db
        .from('users')
        .where('email_verified', true)
        .count('* as total')
        .first()

      return response.ok({
        success: true,
        message: 'Users fetched successfully',
        data: {
          users: users.toJSON().data,
          meta: users.toJSON().meta,
          totalUsers: totalUsersCount?.total || 0,
          activeUsers: activeUsersCount?.total || 0,
        },
      })
    } catch (error) {
      return response.internalServerError(getErrorObject(error))
    }
  }

  public async showAUser({ response, params }: HttpContext) {
    try {
      if (!params.id) {
        return response.badRequest({
          success: false,
          message: 'User ID is required',
        })
      }

      const user = await User.query()
        .where('id', params.id)
        .preload('profileFiles')
        .preload('banks')
        .firstOrFail()

      return response.ok({
        success: true,
        message: 'User fetched successfully',
        data: user,
      })
    } catch (error) {
      return response.internalServerError(getErrorObject(error))
    }
  }
}
