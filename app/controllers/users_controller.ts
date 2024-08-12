import { getErrorObject } from '#helpers/error'
import { updateProfileValidator } from '#validators/user_profile'
import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'

export default class UsersController {
  async me({ auth, response }: HttpContext) {
    try {
      await auth.check()
      const user = auth.user!

      response.ok(user)
    } catch (error) {
      console.log(error.message)
    }
  }

  async updateProfile({ auth, request, response, logger }: HttpContext) {
    try {
      await auth.authenticate()
      const user = auth.user!

      const payload = await request.validateUsing(updateProfileValidator)

      if (payload?.oldPassword && payload?.newPassword) {
        const isPasswordValid = await hash.verify(user.password, payload.oldPassword)

        if (!isPasswordValid) {
          return response.badRequest({
            success: false,
            message: 'Old password is incorrect',
          })
        }

        user.password = payload.newPassword
      }

      const userInfo = {
        fullName: payload?.fullName,
        phoneNumber: payload?.phoneNumber,
        homeAddress: payload?.homeAddress,
        password: payload?.newPassword,
        avatarUrl: payload?.avatarUrl,
        businessName: payload?.businessName,
        businessRegNo: payload?.businessRegNo,
        businessAddress: payload?.businessAddress,
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

      const files: { type: string; url: string }[] = []

      if (payload?.approvalAgreement) {
        files.push({
          type: 'approvalAgreement',
          url: payload?.approvalAgreement,
        })
      }

      if (payload?.identificationCard) {
        files.push({
          type: 'identificationCard',
          url: payload?.identificationCard,
        })
      }

      if (payload?.powerOfAttorney) {
        files.push({
          type: 'powerOfAttorney',
          url: payload?.powerOfAttorney,
        })
      }

      console.log(payload)

      await user.merge(userInfo)

      await user.save()

      logger.info('Profile updated successfully from UsersController.updateProfile')

      response.ok({
        success: true,
        message: 'Profile updated successfully',
      })
    } catch (error) {
      console.log(error.message)
      response.badRequest(
        getErrorObject(error, {
          controller: 'UsersController.updateProfile',
        })
      )
    }
  }
}
