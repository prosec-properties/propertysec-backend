import { getErrorObject } from '#helpers/error'
import Country from '#models/country'
import { createCountryValidator, updateCountryValidator } from '#validators/location'
import type { HttpContext } from '@adonisjs/core/http'

export default class CountriesController {
  public async index({ response, logger }: HttpContext) {
    try {
      const countries = await Country.query().preload('states').orderBy('name', 'asc')
      logger.info('Cities fetched successfully')
      return response.ok({
        success: true,
        message: 'Cities fetched successfully',
        data: countries,
      })
    } catch (error) {
      logger.error('Error fetching cities from CitiesController.index')
      return response.badRequest(getErrorObject(error))
    }
  }

  public async store({ auth, request, response, logger }: HttpContext) {
    try {
      await auth.authenticate()
      const { name } = await request.validateUsing(createCountryValidator)

      await Country.create({
        name,
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
      const city = await Country.findByOrFail('id', id)

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

      const city = await Country.findByOrFail('id', params.id)

      const { name } = await request.validateUsing(updateCountryValidator)

      const payload = {
        name,
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
      const city = await Country.findByOrFail('id', params.id)

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
