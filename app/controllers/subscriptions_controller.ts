import { getErrorObject } from '#helpers/error'
import Subscription from '#models/subscription'
import type { HttpContext } from '@adonisjs/core/http'

export default class SubscriptionsController {
  async fetchSubscribedUsers({ auth, response, request, bouncer }: HttpContext) {
    try {
      await auth.authenticate()
      await bouncer.with('UserPolicy').authorize('isAdmin')
      const { page = 1, limit = 10, search } = request.qs()

      let query = Subscription.query().preload('user').preload('plan')

      if (search) {
        query = query
          .whereHas('user', (userQuery) => {
            userQuery.whereILike('full_name', `%${search}%`).orWhereILike('email', `%${search}%`)
          })
          .orWhereHas('plan', (planQuery) => {
            planQuery.whereILike('name', `%${search}%`)
          })
      }

      const subscriptions = await query.orderBy('created_at', 'desc').paginate(page, limit)

      const [totalResult, activeResult, expiredResult] = await Promise.all([
        Subscription.query().count('*').first(),
        Subscription.query().whereRaw('end_date > NOW()').count('*').first(),
        Subscription.query().whereRaw('end_date <= NOW()').count('*').first(),
      ])

      const totalSubscriptions = Number(totalResult?.$extras.count) || 0
      const activeCount = Number(activeResult?.$extras.count) || 0
      const expiredCount = Number(expiredResult?.$extras.count) || 0

      const subscriptionsWithStatus = subscriptions.toJSON()

      console.log(' subscriptionsWithStatus:', subscriptionsWithStatus)

      return response.ok({
        success: true,
        message: 'Subscribed users fetched sucessfully!',
        data: {
          ...subscriptionsWithStatus,
          statistics: {
            totalSubscriptions,
            activeSubscriptions: activeCount,
            expiredSubscriptions: expiredCount,
          },
        },
      })
    } catch (error) {
      return response.internalServerError(getErrorObject(error))
    }
  }

  async getSubscriptionDetails({ auth, response, params, bouncer }: HttpContext) {
    try {
      await auth.authenticate()
      await bouncer.with('UserPolicy').authorize('isAdmin')

      const subscription = await Subscription.query()
        .where('id', params.id)
        .preload('user')
        .preload('plan')
        .firstOrFail()

      const subscriptionData = subscription.toJSON()

      return response.ok({
        success: true,
        message: 'Subscription details fetched successfully!',
        data: subscriptionData,
      })
    } catch (error) {
      return response.internalServerError(getErrorObject(error))
    }
  }

  async index({ auth, response, request }: HttpContext) {
    try {
      await auth.authenticate()
      const user = auth.user!
      const { page = 1, limit = 10, search } = request.qs()

      let query = Subscription.query()
        .where('userId', user.id)
        .preload('plan')

      if (search) {
        query = query.whereHas('plan', (planQuery) => {
          planQuery
            .where('name', 'ILIKE', `%${search}%`)
            .orWhere('description', 'ILIKE', `%${search}%`)
        })
      }

      query = query.orderBy('createdAt', 'desc')

      const subscriptions = await query.paginate(page, limit)

      // Add calculated fields to each subscription
      const subscriptionsWithStatus = subscriptions.toJSON()
      subscriptionsWithStatus.data = subscriptionsWithStatus.data.map((sub: any) => {
        const now = new Date()
        const endDate = new Date(sub.endDate)
        const isActive = endDate > now
        const daysRemaining = isActive ? Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0

        return {
          ...sub,
          status: isActive ? 'active' : 'expired',
          daysRemaining: daysRemaining,
          isExpired: !isActive,
        }
      })

      const [totalResult, activeResult, expiredResult] = await Promise.all([
        Subscription.query().where('userId', user.id).count('*').first(),
        Subscription.query().where('userId', user.id).whereRaw('end_date > NOW()').count('*').first(),
        Subscription.query().where('userId', user.id).whereRaw('end_date <= NOW()').count('*').first()
      ])

      const totalSubscriptions = Number(totalResult?.$extras.count) || 0
      const activeCount = Number(activeResult?.$extras.count) || 0
      const expiredCount = Number(expiredResult?.$extras.count) || 0

      return response.ok({
        success: true,
        message: 'User subscriptions fetched successfully!',
        data: {
          ...subscriptionsWithStatus,
          statistics: {
            totalSubscriptions,
            activeSubscriptions: activeCount,
            expiredSubscriptions: expiredCount
          }
        },
      })
    } catch (error) {
      return response.internalServerError(getErrorObject(error))
    }
  }
}
