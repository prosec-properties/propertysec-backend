import { getErrorObject } from '#helpers/error'
import User from '#models/user'
import FilesService from '#services/files'
import ProfileFile from '#models/profile_file'
import { updateProfileValidator } from '#validators/user_profile'
import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import { FILE_CATEGORY_ENUM } from '#interfaces/file'
import db from '@adonisjs/lucid/services/db'
import PropertyPurchase from '#models/property_purchase'
import InspectionDetail from '#models/inspection_detail'

export default class UsersController {
  async me({ auth, response, logger }: HttpContext) {
    try {
      await auth.check()
      if (!auth.user) {
        return response.unauthorized({
          success: false,
          message: 'User not authenticated',
        })
      }
      const user = await User.query()
        .where('id', auth.user.id)
        .preload('properties')
        .preload('propertyAccessRequests')
        .preload('profileFiles')
        .preload('subscription', (query) => {
          query.preload('plan')
        })
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
      return response.badRequest(getErrorObject(error))
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
      nextOfKinName: payload.nextOfKin,
      religion: payload.religion,
      monthlySalary: payload.monthlySalary,
      bankName: payload.bankName,
      bankAccountNumber: payload.bankAccountNumber,
      bankAccountName: payload.bankAccountName,
      meta: payload.meta ?? null,
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
      const search = request.input('search', '')

      const orderDirection = order.toLowerCase() === 'asc' ? 'asc' : 'desc'

      const sortableColumns = ['created_at', 'updated_at', 'email', 'first_name', 'last_name']
      const validSortBy = sortableColumns.includes(sortBy) ? sortBy : 'created_at'

      const users = await User.query()
        .if(search, (query) => {
          query.where((subQuery) => {
            subQuery
              .where('fullName', 'ilike', `%${search}%`)
              .orWhere('email', 'ilike', `%${search}%`)
              .orWhere('phoneNumber', 'ilike', `%${search}%`)
              .orWhere('stateOfResidence', 'ilike', `%${search}%`)
              .orWhere('role', 'ilike', `%${search}%`)
          })
        })
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

  async adminUpdateUser({ auth, request, response, params, bouncer, logger }: HttpContext) {
    try {
      await auth.authenticate()
      await bouncer.with('UserPolicy').authorize('isAdmin')

      const { userId } = params
      const user = await User.findOrFail(userId)

      const payload = await request.validateUsing(updateProfileValidator)

      // Update user fields
      if (payload.fullName) user.fullName = payload.fullName
      if (payload.phoneNumber) user.phoneNumber = payload.phoneNumber
      if (payload.nin) user.nin = payload.nin
      if (payload.bvn) user.bvn = payload.bvn
      if (payload.stateOfResidence) user.stateOfResidence = payload.stateOfResidence
      if (payload.nationality) user.nationality = payload.nationality
      if (payload.bankAccountNumber) user.bankAccountNumber = payload.bankAccountNumber
      if (payload.bankAccountName) user.bankAccountName = payload.bankAccountName
      if (payload.businessName) user.businessName = payload.businessName
      if (payload.businessRegNo) user.businessRegNo = payload.businessRegNo
      if (payload.businessAddress) user.businessAddress = payload.businessAddress
      if (payload.cityOfResidence) user.cityOfResidence = payload.cityOfResidence
      if (payload.homeAddress) user.homeAddress = payload.homeAddress
      if (payload.stateOfOrigin) user.stateOfOrigin = payload.stateOfOrigin
      if (payload.nextOfKin) user.nextOfKinName = payload.nextOfKin
      if (payload.religion) user.religion = payload.religion
      if (payload.monthlySalary) user.monthlySalary = payload.monthlySalary
      if (payload.bankName) user.bankName = payload.bankName

      await user.save()

      logger.info('User updated successfully by admin')
      return response.ok({
        success: true,
        message: 'User updated successfully',
        data: user,
      })
    } catch (error) {
      logger.error(error)
      return response.internalServerError(getErrorObject(error))
    }
  }

  async getMyPurchasedProperties({ auth, request, response, logger }: HttpContext) {
    try {
      await auth.authenticate()
      const user = auth.user!

      if (user.role !== 'buyer') {
        return response.forbidden({
          success: false,
          message: 'Only buyers can access this resource',
        })
      }

      const page = request.input('page', 1)
      const perPage = request.input('per_page', 20)
      const sortBy = request.input('sort_by', 'created_at')
      const order = request.input('order', 'desc')

      const orderDirection = order.toLowerCase() === 'asc' ? 'asc' : 'desc'
      const sortableColumns = ['created_at', 'updated_at', 'purchaseAmount', 'purchaseStatus']
      const validSortBy = sortableColumns.includes(sortBy) ? sortBy : 'created_at'

      const purchases = await PropertyPurchase.query()
        .where('userId', user.id)
        .preload('property', (propertyQuery) =>
          propertyQuery
            .preload('files')
            .preload('user', (userQuery) =>
              userQuery.select('id', 'fullName', 'email', 'phoneNumber')
            )
            .select('id', 'title', 'address', 'price', 'currency', 'status', 'availability', 'userId')
        )
        .orderBy(validSortBy, orderDirection)
        .paginate(page, perPage)

      return response.ok({
        success: true,
        message: 'Purchased properties fetched successfully',
        data: {
          purchases: purchases.toJSON().data,
          meta: purchases.toJSON().meta,
        },
      })
    } catch (error) {
      logger.error(error)
      return response.internalServerError(getErrorObject(error))
    }
  }

  async getMyInspectedProperties({ auth, request, response, logger }: HttpContext) {
    try {
      await auth.authenticate()
      const user = auth.user!

      if (user.role !== 'buyer') {
        return response.forbidden({
          success: false,
          message: 'Only buyers can access this resource',
        })
      }

      const page = request.input('page', 1)
      const perPage = request.input('per_page', 20)
      const sortBy = request.input('sort_by', 'created_at')
      const order = request.input('order', 'desc')

      const orderDirection = order.toLowerCase() === 'asc' ? 'asc' : 'desc'
      const sortableColumns = ['created_at', 'updated_at', 'inspectionAmount', 'inspectionStatus']
      const validSortBy = sortableColumns.includes(sortBy) ? sortBy : 'created_at'

      const inspections = await InspectionDetail.query()
        .where('userId', user.id)
        .preload('property', (propertyQuery) =>
          propertyQuery
            .preload('files')
            .preload('user', (userQuery) =>
              userQuery.select('id', 'fullName', 'email', 'phoneNumber')
            )
            .select('id', 'title', 'address', 'price', 'currency', 'status', 'availability', 'userId')
        )
        .orderBy(validSortBy, orderDirection)
        .paginate(page, perPage)

      return response.ok({
        success: true,
        message: 'Inspected properties fetched successfully',
        data: {
          inspections: inspections.toJSON().data,
          meta: inspections.toJSON().meta,
        },
      })
    } catch (error) {
      logger.error(error)
      return response.internalServerError(getErrorObject(error))
    }
  }
}
