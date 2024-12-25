import { getErrorObject } from '#helpers/error'
import type { HttpContext } from '@adonisjs/core/http'
// import vine from '@vinejs/vine'

export default class InspectionDetailsController {
  async store({ response, logger }: HttpContext) {
    try {
      //   await auth.authenticate()
      // const user = auth.user!
      // const payload = await request.validateUsing(
      //   vine.compile(
      //     vine.object({
      //       inspectionReport: vine.string(),
      //       propertyId: vine.string(),
      //       name: vine.string().minLength(3),
      //       email: vine.string().email(),
      //       phoneNumber: vine.string().mobile().minLength(11),
      //     })
      //   )
      // )

      //   const inspectionDetails = await InspectionDetails.create({
      //     ...payload,
      //     userId: user.id,
      //   })

      return response.ok({
        success: true,
        message: 'Inspection details created successfully!',
        // inspectionDetails,
      })
    } catch (error) {
      logger.error('Error creating inspection details', error)
      return response.badRequest(getErrorObject(error))
    }
  }
}
