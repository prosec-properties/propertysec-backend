import Setting from '#models/setting'
import NewsletterSubscriber from '#models/newsletter_subscriber'
import logger from '@adonisjs/core/services/logger'

interface UserRegisteredPayload {
  userId: string
  email: string
}

export default class UserListener {
  public async onRegistered({ userId, email }: UserRegisteredPayload) {
    await this.ensureDefaultSettings(userId)
    await this.ensureNewsletterSubscription({ userId, email })
  }

  private async ensureDefaultSettings(userId: string) {
    try {
      await Setting.firstOrCreate(
        { userId },
        {
          userId,
          emailNotificationsFeatureUpdates: true,
          emailNotificationsListingUpdates: true,
        }
      )
    } catch (error) {
      logger.error(
        {
          err: error,
          userId,
        },
        'Failed to create default notification settings for new user'
      )
    }
  }

  private async ensureNewsletterSubscription({
    userId,
    email,
  }: {
    userId: string
    email: string
  }) {
    if (!email) {
      return
    }

    try {
      const subscriber = await NewsletterSubscriber.firstOrCreate(
        { email },
        {
          email,
          status: 'subscribed',
          userId,
        }
      )

      if (subscriber.status !== 'subscribed' || !subscriber.userId) {
        subscriber.status = 'subscribed'
        subscriber.userId = subscriber.userId || userId
        await subscriber.save()
      }
    } catch (error) {
      logger.error(
        {
          err: error,
          userId,
          email,
        },
        'Failed to subscribe user to newsletter on registration'
      )
    }
  }
}
