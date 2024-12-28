import { propertyCommission } from '#helpers/general'
import Affiliate from '#models/affiliate_property'
import Property from '#models/property'
import type { HttpContext } from '@adonisjs/core/http'

export default class AffiliatesController {
  async saveToShop({ auth, request, response }: HttpContext) {
    try {
      await auth.authenticate()
      const user = auth.user!
      const { propertyId } = request.body()

      const property = await Property.findBy('id', propertyId)
      if (!property) {
        return response.badRequest({
          status: 'error',
          message: 'Property not found',
        })
      }

      const getCommission = propertyCommission(property.price)

      await Affiliate.create({
        affiliateUserId: user.id,
        propertyId,
        commission: getCommission,
        isActive: true,
      })

      return response.json({
        status: 'success',
        message: 'Property saved to shop',
        data: [],
      })

      console.log('saveToShop')
    } catch (error) {
      console.log(error)
    }
  }
}
