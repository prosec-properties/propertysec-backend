import { getErrorObject } from '#helpers/error'
import Property from '#models/property'
import PropertyPurchase from '#models/property_purchase'
import User from '#models/user'
import InspectionDetail from '#models/inspection_detail'
import Loan from '#models/loan'
import UserSetting from '#models/user_setting'
import Subscription from '#models/subscription'
import type { HttpContext } from '@adonisjs/core/http'

export default class AdminController {
  public async fetchAllUsers({ auth, response, request, bouncer }: HttpContext) {
    try {
      await auth.authenticate()
      await bouncer.with('UserPolicy').authorize('isAdmin')

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

      const [totalUsers, subscribedUsers] = await Promise.all([
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
          subscribedUsers: subscribedUsers[0]?.$extras?.total || 0,
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

      await InspectionDetail.query().where('userId', userId).delete()
      await Loan.query().where('userId', userId).delete()
      await UserSetting.query().where('userId', userId).delete()
      await Subscription.query().where('userId', userId).delete()

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

  async impersonateUser({ auth, response, params, bouncer }: HttpContext) {
    try {
      await auth.authenticate()
      await bouncer.with('UserPolicy').authorize('isAdmin')

      const { userId } = params
      const targetUser = await User.findOrFail(userId)

      // Generate a token for the target user
      const token = await User.accessTokens.create(targetUser, ['*'], {
        expiresIn: '24hours', // Shorter expiry for impersonation
      })

      return response.ok({
        success: true,
        message: 'Impersonation token generated successfully',
        data: {
          token: token.toJSON(),
          user: targetUser.toJSON(),
          impersonatedBy: auth.user!.id,
        },
      })
    } catch (error) {
      return response.internalServerError(getErrorObject(error))
    }
  }

  public async fetchUserProperties({ auth, response, request, params, bouncer }: HttpContext) {
    try {
      await auth.authenticate()
      await bouncer.with('UserPolicy').authorize('isAdmin')

      const { userId } = params
      const page = request.input('page', 1)
      const perPage = request.input('per_page', 20)
      const sortBy = request.input('sort_by', 'created_at')
      const order = request.input('order', 'desc')
      const status = request.input('status')

      const orderDirection = order.toLowerCase() === 'asc' ? 'asc' : 'desc'
      const sortableColumns = ['created_at', 'updated_at', 'title', 'price', 'status']
      const validSortBy = sortableColumns.includes(sortBy) ? sortBy : 'created_at'

      const user = await User.findOrFail(userId)

      const propertiesQuery = Property.query()
        .where('userId', userId)
        .preload('files')

      if (status && status !== 'all') {
        if (status === 'sold') {
          propertiesQuery.where('availability', 'sold')
        } else {
          propertiesQuery.where('status', status)
        }
      }

      const properties = await propertiesQuery
        .orderBy(validSortBy, orderDirection)
        .paginate(page, perPage)

      return response.ok({
        success: true,
        message: 'User properties fetched successfully',
        data: {
          properties: properties.toJSON().data,
          meta: properties.toJSON().meta,
          user: user.toJSON(),
        },
      })
    } catch (error) {
      return response.internalServerError(getErrorObject(error))
    }
  }

  public async updateUserProperty({ auth, response, request, params, bouncer }: HttpContext) {
    try {
      await auth.authenticate()
      await bouncer.with('UserPolicy').authorize('isAdmin')

      const { userId, propertyId } = params
      const updateData = request.only([
        'title',
        'description',
        'price',
        'currency',
        'status',
        'availability',
        'bedrooms',
        'bathrooms',
        'toilets',
        'address',
        'street',
        'cityId',
        'stateId',
        'countryId',
        'categoryId',
        'type',
        'meta',
      ])

      const property = await Property.findOrFail(propertyId)

      // Ensure the property belongs to the user
      if (property.userId !== userId) {
        return response.badRequest({
          success: false,
          message: 'Property does not belong to the specified user',
        })
      }

      await property.merge(updateData).save()

      return response.ok({
        success: true,
        message: 'Property updated successfully',
        data: { property },
      })
    } catch (error) {
      return response.internalServerError(getErrorObject(error))
    }
  }

  public async fetchAffiliateProperties({ auth, response, request, params, bouncer }: HttpContext) {
    try {
      await auth.authenticate()
      await bouncer.with('UserPolicy').authorize('isAdmin')

      const { affiliateId } = params
      const page = request.input('page', 1)
      const perPage = request.input('per_page', 20)
      const sortBy = request.input('sort_by', 'created_at')
      const order = request.input('order', 'desc')

      const orderDirection = order.toLowerCase() === 'asc' ? 'asc' : 'desc'
      const sortableColumns = ['created_at', 'updated_at', 'title', 'price', 'status']
      const validSortBy = sortableColumns.includes(sortBy) ? sortBy : 'created_at'

      const affiliate = await User.findOrFail(affiliateId)

      if (affiliate.role !== 'affiliate') {
        return response.badRequest({
          success: false,
          message: 'User is not an affiliate',
        })
      }

      const properties = await Property.query()
        .where('affiliateId', affiliateId)
        .preload('files')
        .preload('user', (userQuery) => userQuery.select('id', 'fullName', 'email'))
        .orderBy(validSortBy, orderDirection)
        .paginate(page, perPage)

      return response.ok({
        success: true,
        message: 'Affiliate properties fetched successfully',
        data: {
          properties: properties.toJSON().data,
          meta: properties.toJSON().meta,
          affiliate: affiliate.toJSON(),
        },
      })
    } catch (error) {
      return response.internalServerError(getErrorObject(error))
    }
  }

  public async fetchBuyerInspectedProperties({
    auth,
    response,
    request,
    params,
    bouncer,
  }: HttpContext) {
    try {
      await auth.authenticate()
      await bouncer.with('UserPolicy').authorize('isAdmin')

      const { buyerId } = params
      const page = request.input('page', 1)
      const perPage = request.input('per_page', 20)
      const sortBy = request.input('sort_by', 'created_at')
      const order = request.input('order', 'desc')

      const orderDirection = order.toLowerCase() === 'asc' ? 'asc' : 'desc'
      const sortableColumns = ['created_at', 'updated_at', 'inspectionAmount', 'inspectionStatus']
      const validSortBy = sortableColumns.includes(sortBy) ? sortBy : 'created_at'

      const buyer = await User.findOrFail(buyerId)

      if (buyer.role !== 'buyer') {
        return response.badRequest({
          success: false,
          message: 'User is not a buyer',
        })
      }

      const inspections = await InspectionDetail.query()
        .where('userId', buyerId)
        .preload('property', (propertyQuery) =>
          propertyQuery
            .preload('files')
            .select('id', 'title', 'address', 'price', 'currency', 'status', 'availability')
        )
        .orderBy(validSortBy, orderDirection)
        .paginate(page, perPage)

      return response.ok({
        success: true,
        message: 'Buyer inspected properties fetched successfully',
        data: {
          inspections: inspections.toJSON().data,
          meta: inspections.toJSON().meta,
          buyer: buyer.toJSON(),
        },
      })
    } catch (error) {
      return response.internalServerError(getErrorObject(error))
    }
  }

  public async fetchBuyerPurchasedProperties({
    auth,
    response,
    request,
    params,
    bouncer,
  }: HttpContext) {
    try {
      await auth.authenticate()
      await bouncer.with('UserPolicy').authorize('isAdmin')

      const { buyerId } = params
      const page = request.input('page', 1)
      const perPage = request.input('per_page', 20)
      const sortBy = request.input('sort_by', 'created_at')
      const order = request.input('order', 'desc')

      const orderDirection = order.toLowerCase() === 'asc' ? 'asc' : 'desc'
      const sortableColumns = ['created_at', 'updated_at', 'purchaseAmount', 'purchaseStatus']
      const validSortBy = sortableColumns.includes(sortBy) ? sortBy : 'created_at'

      const buyer = await User.findOrFail(buyerId)

      if (buyer.role !== 'buyer') {
        return response.badRequest({
          success: false,
          message: 'User is not a buyer',
        })
      }

      const purchases = await PropertyPurchase.query()
        .where('userId', buyerId)
        .preload('property', (propertyQuery) =>
          propertyQuery
            .preload('files')
            .select('id', 'title', 'address', 'price', 'currency', 'status', 'availability')
        )
        .orderBy(validSortBy, orderDirection)
        .paginate(page, perPage)

      return response.ok({
        success: true,
        message: 'Buyer purchased properties fetched successfully',
        data: {
          purchases: purchases.toJSON().data,
          meta: purchases.toJSON().meta,
          buyer: buyer.toJSON(),
        },
      })
    } catch (error) {
      return response.internalServerError(getErrorObject(error))
    }
  }
}
