import { getErrorObject } from '#helpers/error'
import State from '#models/state'
import { createStateValidator, updateStateValidator } from '#validators/location'
import type { HttpContext } from '@adonisjs/core/http'

export default class StatesController {
  public async index({ response, logger }: HttpContext) {
    try {
      const states = await State.query().preload('cities').orderBy('name', 'asc')
      logger.info('States fetched successfully')
      return response.ok({
        success: true,
        message: 'States fetched successfully',
        data: states,
      })
    } catch (error) {
      logger.error('Error fetching states from StatesController.index')
      return response.badRequest(getErrorObject(error))
    }
  }

  public async store({ auth, request, response, logger }: HttpContext) {
    try {
      await auth.authenticate()

      const { name, countryId } = await request.validateUsing(createStateValidator)

      await State.create({
        name,
        countryId,
      })

      logger.info('State created successfully')

      return response.created({
        success: true,
        message: 'State created successfully',
      })
    } catch (error) {
      logger.error('Error creating state from StatesController.store')
      return response.badRequest(getErrorObject(error))
    }
  }

  public async show({ params, response, logger }: HttpContext) {
    try {
      const { id } = params
      const state = await State.findByOrFail('id', id)

      logger.info('State fetched successfully')

      return response.ok({
        success: true,
        message: 'State fetched successfully',
        data: state,
      })
    } catch (error) {
      logger.error('Error fetching state from StatesController.show')
      return response.badRequest(getErrorObject(error))
    }
  }

  public async update({ auth, params, request, response, logger }: HttpContext) {
    try {
      await auth.authenticate()

      const state = await State.findByOrFail('id', params.id)

      const { name, countryId, isActive } = await request.validateUsing(updateStateValidator)

      const payload = {
        name,
        countryId,
        isActive,
      }

      await state.merge(payload).save()

      logger.info('State updated successfully')

      return response.ok({
        success: true,
        message: 'State updated successfully',
      })
    } catch (error) {
      logger.error('Error updating state from StatesController.update')
      return response.badRequest(getErrorObject(error))
    }
  }

  public async destroy({ auth, params, response, logger }: HttpContext) {
    try {
      await auth.authenticate()

      const state = await State.findByOrFail('id', params.id)

      await state.delete()

      logger.info('State deleted successfully')

      return response.ok({
        success: true,
        message: 'State deleted successfully',
      })
    } catch (error) {
      logger.error('Error deleting state from StatesController.destroy')
      return response.badRequest(getErrorObject(error))
    }
  }
}
