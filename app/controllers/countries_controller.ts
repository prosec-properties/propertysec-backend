import { getErrorObject } from '#helpers/error'
import Country from '#models/country'
import { createCountryValidator, updateCountryValidator } from '#validators/location'
import type { HttpContext } from '@adonisjs/core/http'

export default class CountriesController {
  public async index({ request, response, logger }: HttpContext) {
    try {
      const page = request.input('page', 1)
      const limit = request.input('limit', 20)

      let query = Country.query()
        .preload('states', (statesQuery) => {
          statesQuery.preload('cities')
        })
        .orderBy('created_at', 'desc')

      const countries = await query.paginate(page, limit)

      console.log(countries.toJSON())

      logger.info('Countries fetched successfully')

      return response.ok({
        success: true,
        message: 'Countries fetched successfully',
        data: countries,
      })
    } catch (error) {
      logger.error('Error fetching countries from CountriesController.index', error)
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

      logger.info('Country created successfully')

      return response.created({
        success: true,
        message: 'Country created successfully',
      })
    } catch (error) {
      logger.error('Error creating city from CitiesController.store')
      return response.badRequest(getErrorObject(error))
    }
  }

  public async show({ params, response, logger }: HttpContext) {
    try {
      const country = await Country.query()
        .where('id', params.id)
        .preload('states', (statesQuery) => {
          statesQuery.preload('cities')
        })
        .firstOrFail()

      logger.info('Country fetched successfully')

      return response.ok({
        success: true,
        message: 'Country fetched successfully',
        data: country,
      })
    } catch (error) {
      logger.error('Error fetching country from CountriesController.show', error)
      return response.badRequest(getErrorObject(error))
    }
  }

  public async update({ auth, params, request, response, logger }: HttpContext) {
    try {
      await auth.authenticate()

      const country = await Country.findByOrFail('id', params.id)

      const { name } = await request.validateUsing(updateCountryValidator)

      const payload = {
        name,
      }

      await country.merge(payload).save()

      logger.info('Country updated successfully')

      return response.ok({
        success: true,
        message: 'Country updated successfully',
      })
    } catch (error) {
      logger.error('Error updating country from CountriesController.update')
      return response.badRequest(getErrorObject(error))
    }
  }

  public async destroy({ auth, params, response, logger }: HttpContext) {
    try {
      await auth.authenticate()
      const country = await Country.findByOrFail('id', params.id)

      await country.delete()

      logger.info('Country deleted successfully')

      return response.ok({
        success: true,
        message: 'Country deleted successfully',
      })
    } catch (error) {
      logger.error('Error deleting country from CountriesController.destroy')
      return response.badRequest(getErrorObject(error))
    }
  }
}
