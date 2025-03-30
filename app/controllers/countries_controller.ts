import { getErrorObject } from '#helpers/error'
import Country from '#models/country'
import { createCountryValidator, updateCountryValidator } from '#validators/location'
import type { HttpContext } from '@adonisjs/core/http'

export default class CountriesController {
  public async index({ response, logger }: HttpContext) {
    try {
      const countries = await Country.query().orderBy('created_at', 'desc')

      logger.info('Countries fetched successfully')

      return response.ok({
        success: true,
        message: 'Countries fetched successfully',
        data: countries,
      })
    } catch (error) {
      logger.error({ error }, 'Error fetching countries from CountriesController.index')
      return response.internalServerError(getErrorObject(error))
    }
  }

  public async store({ auth, request, response, logger }: HttpContext) {
    try {
      await auth.authenticate()
      const { name } = await request.validateUsing(createCountryValidator)

      const country = await Country.create({
        name,
      })

      logger.info(`Country created successfully with ID: ${country.id}`)

      return response.created({
        success: true,
        message: 'Country created successfully',
        data: { id: country.id },
      })
    } catch (error) {
      logger.error({ error }, 'Error creating country from CountriesController.store')
      return response.badRequest(getErrorObject(error))
    }
  }

  public async show({ params, response, logger }: HttpContext) {
    try {
      const country = await Country.query()
        .where('id', params.id)
        .preload('states', (statesQuery) => {
          statesQuery.orderBy('name').preload('cities', (citiesQuery) => {
            citiesQuery.orderBy('name')
          })
        })
        .firstOrFail()

      logger.info(`Country fetched successfully with ID: ${params.id}`)

      return response.ok({
        success: true,
        message: 'Country fetched successfully',
        data: country,
      })
    } catch (error) {
      logger.error(
        { error },
        `Error fetching country with ID: ${params.id} from CountriesController.show`
      )
      return response.notFound(getErrorObject(error))
    }
  }

  public async update({ auth, params, request, response, logger }: HttpContext) {
    try {
      await auth.authenticate()

      const country = await Country.findByOrFail('id', params.id)
      const { name } = await request.validateUsing(updateCountryValidator)

      await country.merge({ name }).save()

      logger.info(`Country updated successfully with ID: ${params.id}`)

      return response.ok({
        success: true,
        message: 'Country updated successfully',
        data: { id: country.id },
      })
    } catch (error) {
      logger.error(
        { error },
        `Error updating country with ID: ${params.id} from CountriesController.update`
      )
      return response.badRequest(getErrorObject(error))
    }
  }

  public async destroy({ auth, params, response, logger }: HttpContext) {
    try {
      await auth.authenticate()
      const country = await Country.findByOrFail('id', params.id)

      await country.delete()

      logger.info(`Country deleted successfully with ID: ${params.id}`)

      return response.ok({
        success: true,
        message: 'Country deleted successfully',
        data: { id: params.id },
      })
    } catch (error) {
      logger.error(
        { error },
        `Error deleting country with ID: ${params.id} from CountriesController.destroy`
      )
      return response.badRequest(getErrorObject(error))
    }
  }
}
