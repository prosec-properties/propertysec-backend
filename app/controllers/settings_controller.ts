import { getErrorObject } from '#helpers/error'
import Setting from '#models/setting'
import { updateSettingsValidator } from '#validators/setting'
import type { HttpContext } from '@adonisjs/core/http'

export default class SettingsController {
  async show({ auth, response, logger }: HttpContext) {
    try {
      const user = await auth.authenticate()

      const settings = await SettingsController.getSettings(user.id)

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
      let settings = await Setting.query().where('user_id', userId).first()

      if (!settings) {
        settings = await Setting.create({
          userId: userId,
        })
      }
      return settings
    } catch (error) {
      throw error
    }
  }
}
