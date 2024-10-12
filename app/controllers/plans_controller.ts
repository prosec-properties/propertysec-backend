import { getErrorObject } from '#helpers/error'
import Plan from '#models/plan'
import { UpdatePlanValidator } from '#validators/plan'
import type { HttpContext } from '@adonisjs/core/http'

export default class PlansContoller {
  async index({ auth, logger, response, request }: HttpContext) {
    const { duration } = request.qs()
    console.log('Duration:', duration)

    try {
      await auth.authenticate()

      const query = Plan.query()

      if (duration) {
        query.where('duration', duration)
      }

      const plans = await query.orderBy('order', 'asc')

      logger.info('Plans fetched successfully', { duration })

      return response.ok({
        message: 'Plans fetched successfully',
        success: true,
        data: plans,
      })
    } catch (error) {
      logger.error('Error fetching plans:', getErrorObject(error))
      return response.badRequest(getErrorObject(error))
    }
  }

  public async show({ response, request, logger }: HttpContext) {
    try {
      const { id } = request.params()
      const plans = await Plan.findBy('id', id)

      logger.info('Plans fetched successfully')
      return response.ok(plans)
    } catch (error) {
      return response.badRequest(getErrorObject(error))
    }
  }

  public async update({ response, request, logger, params, auth, bouncer }: HttpContext) {
    try {
      await auth.authenticate()
      const isAdmin = await bouncer.with('UserPolicy').denies('isAdmin')

      if (isAdmin) {
        return response.forbidden({
          success: false,
          message: 'You are not authorized to perform this action',
        })
      }
      const { id } = params
      const { price, discount } = await request.validateUsing(UpdatePlanValidator)
      const plan = await Plan.findOrFail(id)

      await plan.merge({ price, discountPercentage: discount }).save()
      logger.info('Plans updated successfully')

      return response.ok(plan)
    } catch (error) {
      return response.badRequest(getErrorObject(error))
    }
  }
}
