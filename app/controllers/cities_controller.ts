import { getErrorObject } from '#helpers/error'
import City from '#models/city'
import { createCityValidator, updateCityValidator } from '#validators/location'
import type { HttpContext } from '@adonisjs/core/http'

export default class CitiesController {
  public async index({ response, logger }: HttpContext) {
    try {
      const cities = await City.query().preload('state').orderBy('name', 'asc')
      logger.info('Cities fetched successfully')
      return response.ok({
        success: true,
        message: 'Cities fetched successfully',
        data: cities,
      })
    } catch (error) {
      logger.error('Error fetching cities from CitiesController.index')
      return response.badRequest(getErrorObject(error))
    }
  }

  public async store({ auth, request, response, logger }: HttpContext) {
    try {
      await auth.authenticate()
      const { name, stateId } = await request.validateUsing(createCityValidator)

      await City.create({
        name,
        stateId,
      })

      logger.info('City created successfully')

      return response.created({
        success: true,
        message: 'City created successfully',
      })
    } catch (error) {
      logger.error('Error creating city from CitiesController.store')
      return response.badRequest(getErrorObject(error))
    }
  }

  public async show({ params, response, logger }: HttpContext) {
    try {
      const { id } = params
      const city = await City.findByOrFail('id', id)

      logger.info('City fetched successfully')

      return response.ok({
        success: true,
        message: 'City fetched successfully',
        data: city,
      })
    } catch (error) {
      logger.error('Error fetching city from CitiesController.show')
      return response.badRequest(getErrorObject(error))
    }
  }

  public async update({ auth, params, request, response, logger }: HttpContext) {
    try {
      await auth.authenticate()

      const city = await City.findByOrFail('id', params.id)

      const { name, stateId, isActive } = await request.validateUsing(updateCityValidator)

      const payload = {
        name,
        stateId,
        isActive,
      }

      await city.merge(payload).save()

      logger.info('City updated successfully')

      return response.ok({
        success: true,
        message: 'City updated successfully',
      })
    } catch (error) {
      logger.error('Error updating city from CitiesController.update')
      return response.badRequest(getErrorObject(error))
    }
  }

  public async destroy({ auth, params, response, logger }: HttpContext) {
    try {
      await auth.authenticate()
      const city = await City.findByOrFail('id', params.id)

      await city.delete()

      logger.info('City deleted successfully')

      return response.ok({
        success: true,
        message: 'City deleted successfully',
      })
    } catch (error) {
      logger.error('Error deleting city from CitiesController.destroy')
      return response.badRequest(getErrorObject(error))
    }
  }
}
