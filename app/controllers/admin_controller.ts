import { getErrorObject } from '#helpers/error'
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class AdminController {
  public async fetchAllUsers({ auth, response, request, bouncer }: HttpContext) {
    try {
      await auth.authenticate()
      await bouncer.with('UserPolicy').authorize('isAdmin')

      // Get query parameters with defaults
      const page = request.input('page', 1)
      const perPage = request.input('per_page', 20)
      const sortBy = request.input('sort_by', 'created_at')
      const order = request.input('order', 'desc')

      const orderDirection = order.toLowerCase() === 'asc' ? 'asc' : 'desc'

      const sortableColumns = ['created_at', 'updated_at', 'email', 'first_name', 'last_name']
      const validSortBy = sortableColumns.includes(sortBy) ? sortBy : 'created_at'

      const users = await User.query()
        .preload('profileFiles')
        .orderBy(validSortBy, orderDirection)
        .paginate(page, perPage)

      return response.ok({
        success: true,
        message: 'Users fetched successfully',
        data: {
          users: users.toJSON().data,
          meta: users.toJSON().meta,
        },
      })
    } catch (error) {
      return response.internalServerError(getErrorObject(error))
    }
  }

  async deleteUser({ auth, response, params, bouncer }: HttpContext) {
    try {
      await auth.authenticate()
      await bouncer.with('UserPolicy').authorize('isAdmin')
      const { userId } = params
      const user = await User.findOrFail(userId)

      const isAdmin = user.role === 'admin'
      if (isAdmin) {
        return response.badRequest({
          success: false,
          message: 'Cannot delete admin user',
        })
      }
      await user.delete()
      return response.ok({
        success: true,
        message: 'User deleted successfully',
      })
    } catch (error) {
      return response.badRequest(getErrorObject(error))
    }
  }

  async approveBuyerUser({ auth, response, params, bouncer }: HttpContext) {
    try {
      await auth.authenticate()
      await bouncer.with('UserPolicy').authorize('isAdmin')
      const { userId } = params
      const user = await User.findOrFail(userId)

      const buyer = user.role === 'buyer'

      if (!buyer) {
        return response.badRequest({
          success: false,
          message: 'User is not a buyer',
        })
      }

      user.buyerApproved = true
      await user.save()

      return response.ok({
        success: true,
        message: 'User approved successfully',
      })
    } catch (error) {
      return response.badRequest(getErrorObject(error))
    }
  }

  async rejectBuyerUser({ auth, response, params, bouncer }: HttpContext) {
    try {
      await auth.authenticate()
      await bouncer.with('UserPolicy').authorize('isAdmin')
      const { userId } = params
      const user = await User.findOrFail(userId)
      const buyer = user.role === 'buyer'
      if (!buyer) {
        return response.badRequest({
          success: false,
          message: 'User is not a buyer',
        })
      }

      user.buyerApproved = false
      await user.save()
      return response.ok({
        success: true,
        message: 'User approval withdrawn successfully',
      })
    } catch (error) {
      return response.badRequest(getErrorObject(error))
    }
  }
}
