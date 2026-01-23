import { getErrorObject } from '#helpers/error'
import Setting from '#models/setting'
import { updateSettingsValidator } from '#validators/setting'
import type { HttpContext } from '@adonisjs/core/http'
import cache from '@adonisjs/cache/services/main'

export default class SettingsController {
  async show({ auth, response, logger }: HttpContext) {
    try {
      const user = await auth.authenticate()

      const cacheKey = `settings:${user.id}`
      const settings = await cache.getOrSet({
        key: cacheKey,
        factory: async () => {
          const result = await SettingsController.getSettings(user.id)
          return result.toJSON()
        },
        ttl: '1m',
      })

      logger.info('SettingsController.index - Settings retrieved successfully')
      return response.ok({
        message: 'Settings retrieved successfully',
        success: true,
        data: settings,
      })
    } catch (error) {
      logger.error(error, 'SettingsController.index - Error retrieving settings')
      return response.badRequest(getErrorObject(error))
    }
  }

  async update({ auth, request, response, logger }: HttpContext) {
    try {
      const user = await auth.authenticate()

      const settings = await SettingsController.getSettings(user.id)

      const data = request.all()

      const payload = await updateSettingsValidator.validate(data)

      settings.merge(payload)
      await settings.save()
      await settings.refresh()

      // Invalidate cache
      await cache.delete({ key: `settings:${user.id}` })

      logger.info('SettingsController.update - Settings updated successfully')

      return response.ok({
        message: 'Settings updated successfully',
        success: true,
        data: settings,
      })
    } catch (error) {
      logger.error(error, 'SettingsController.update - Error updating settings')
      return response.badRequest(getErrorObject(error))
    }
  }

  static async getSettings(userId: string) {
    try {
      const settings = await Setting.firstOrCreate(
        { userId },
        {
          userId,
          emailNotificationsFeatureUpdates: true,
          emailNotificationsListingUpdates: true,
        }
      )

      await settings.refresh()

      return settings
    } catch (error) {
      throw error
    }
  }
}
