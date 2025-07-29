import { getErrorObject } from '#helpers/error'
import Property from '#models/property'
import PropertyPurchase from '#models/property_purchase'
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
      const search = request.input('search')

      const orderDirection = order.toLowerCase() === 'asc' ? 'asc' : 'desc'

      const sortableColumns = ['created_at', 'updated_at', 'email', 'first_name', 'last_name']
      const validSortBy = sortableColumns.includes(sortBy) ? sortBy : 'created_at'

      let query = User.query().preload('profileFiles').orderBy(validSortBy, orderDirection)

      if (search) {
        query = query.where((builder) => {
          builder
            .where('full_name', 'ILIKE', `%${search}%`)
            .orWhere('email', 'ILIKE', `%${search}%`)
            .orWhere('phone_number', 'ILIKE', `%${search}%`)
        })
      }

      const users = await query.paginate(page, perPage)

      let baseStatsQuery = User.query()

      const [totalUsers, activeUsers] = await Promise.all([
        baseStatsQuery.clone().count('* as total'),
        baseStatsQuery.clone().where('subscription_status', 'active').count('* as total'),
      ])

      return response.ok({
        success: true,
        message: 'Users fetched successfully',
        data: {
          users: users.toJSON().data,
          meta: users.toJSON().meta,
          totalUsers: totalUsers[0]?.$extras?.total || 0,
          activeUsers: activeUsers[0]?.$extras?.total || 0,
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

  public async fetchPropertyPurchases({ auth, response, request, bouncer }: HttpContext) {
    try {
      await auth.authenticate()
      await bouncer.with('UserPolicy').authorize('isAdmin')

      // Get query parameters with defaults
      const page = request.input('page', 1)
      const perPage = request.input('per_page', 20)
      const sortBy = request.input('sort_by', 'created_at')
      const order = request.input('order', 'desc')
      const status = request.input('status', '')

      const orderDirection = order.toLowerCase() === 'asc' ? 'asc' : 'desc'

      const sortableColumns = ['created_at', 'updated_at', 'purchase_amount', 'purchase_status']
      const validSortBy = sortableColumns.includes(sortBy) ? sortBy : 'created_at'

      let query = PropertyPurchase.query()
        .preload('user', (userQuery) => userQuery.select('id', 'fullName', 'email'))
        .preload('property', (propertyQuery) =>
          propertyQuery.select('id', 'title', 'address', 'price', 'currency', 'availability')
        )
        .orderBy(validSortBy, orderDirection)

      // Filter by status if provided
      if (status && status.trim() !== '') {
        query = query.where('purchaseStatus', status)
      }

      const purchases = await query.paginate(page, perPage)

      return response.ok({
        success: true,
        message: 'Property purchases fetched successfully',
        data: {
          purchases: purchases.toJSON().data,
          meta: purchases.toJSON().meta,
        },
      })
    } catch (error) {
      return response.internalServerError(getErrorObject(error))
    }
  }

  public async updatePropertyPurchaseStatus({
    auth,
    response,
    params,
    request,
    bouncer,
  }: HttpContext) {
    try {
      await auth.authenticate()
      await bouncer.with('UserPolicy').authorize('isAdmin')

      const { purchaseId } = params
      const { status } = request.only(['status'])

      if (!['PENDING', 'COMPLETED', 'CANCELLED', 'REFUNDED'].includes(status)) {
        return response.badRequest({
          success: false,
          message: 'Invalid status. Must be one of: PENDING, COMPLETED, CANCELLED, REFUNDED',
        })
      }

      const purchase = await PropertyPurchase.findOrFail(purchaseId)
      await purchase.merge({ purchaseStatus: status }).save()

      // If cancelling or refunding, update property availability back to available
      if (status === 'CANCELLED' || status === 'REFUNDED') {
        await Property.query()
          .where('id', purchase.propertyId)
          .update({ availability: 'available' })
      }

      return response.ok({
        success: true,
        message: 'Property purchase status updated successfully',
        data: { purchase },
      })
    } catch (error) {
      return response.internalServerError(getErrorObject(error))
    }
  }
}
