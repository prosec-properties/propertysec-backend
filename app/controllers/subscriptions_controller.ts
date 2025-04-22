import { getErrorObject } from '#helpers/error'
import Subscription from '#models/subscription'
import type { HttpContext } from '@adonisjs/core/http'

export default class SubscriptionsController {
  async fetchSubscribedUsers({ auth, response, request, bouncer }: HttpContext) {
    try {
      await auth.authenticate()
      await bouncer.with('UserPolicy').authorize('isAdmin')
      const { page = 1, limit = 10 } = request.qs()

      const subscriptions = await Subscription.query()
        .preload('user')
        .preload('plan')
        .orderBy('created_at', 'desc')
        .paginate(page, limit)

      return response.ok({
        success: true,
        message: 'Subscribed users fetched sucessfully!',
        data: subscriptions,
      })
    } catch (error) {
      return response.internalServerError(getErrorObject(error))
    }
  }
}
