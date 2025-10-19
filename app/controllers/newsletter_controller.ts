import { subscribeNewsletterValidator } from '#validators/newsletter'
import NewsletterSubscriber from '#models/newsletter_subscriber'
import { getErrorObject } from '#helpers/error'
import type { HttpContext } from '@adonisjs/core/http'

export default class NewsletterController {
  async subscribe({ request, response, auth, logger }: HttpContext) {
    try {
      const { email } = await request.validateUsing(subscribeNewsletterValidator)

      let userId: string | undefined
      try {
        if (await auth.check()) {
          userId = auth.user?.id
        }
      } catch (error) {
        logger.trace({ err: error }, 'Unable to determine authenticated user for newsletter subscribe')
      }

      const payload: {
        email: string
        status: 'subscribed'
        userId?: string
      } = {
        email,
        status: 'subscribed',
      }

      if (userId) {
        payload.userId = userId
      }

      const subscriber = await NewsletterSubscriber.updateOrCreate({ email }, payload)

      if (userId && subscriber.userId !== userId) {
        subscriber.userId = userId
        await subscriber.save()
      }

      logger.info({ email, userId }, 'Newsletter subscription upserted successfully')

      return response.ok({
        success: true,
        message: 'Subscribed to newsletter successfully',
        data: {
          id: subscriber.id,
          email: subscriber.email,
          status: subscriber.status,
        },
      })
    } catch (error) {
      logger.error({ err: error }, 'Newsletter subscription failed')
      return response.badRequest(getErrorObject(error))
    }
  }
}
