import { getErrorObject } from '#helpers/error'
import { propertyCommission } from '#helpers/general'
import AffiliateProperty from '#models/affiliate_property'
import Property from '#models/property'
import Wallet from '#models/wallet'
import { addToAffiliateShopValidator } from '#validators/affiliate'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class AffiliatesController {
  async saveToShop({ auth, request, response }: HttpContext) {
    try {
      await auth.authenticate()
      const user = auth.user!

      const { propertyId } = await request.validateUsing(addToAffiliateShopValidator)

      const property = await Property.findBy('id', propertyId)

      if (!property) {
        return response.notFound({
          status: 'error',
          message: 'Property not found',
        })
      }

      const existingAffiliate = await AffiliateProperty.query()
        .where('affiliateUserId', user.id)
        .where('propertyId', propertyId)
        .first()

      if (existingAffiliate) {
        return response.conflict({
          status: 'error',
          message: 'Property already exists in your shop',
        })
      }

      const commission = propertyCommission(property.price)

      await AffiliateProperty.create({
        affiliateUserId: user.id,
        propertyId,
        commission,
        isActive: true,
      })

      return response.created({
        status: 'success',
        message: 'Property saved to shop successfully',
        data: {
          property,
          commission,
        },
      })
    } catch (error) {
      console.error('Error in saveToShop:', error)
      return response.internalServerError(getErrorObject(error))
    }
  }

  async isPropertyInShop({ auth, response, params, logger }: HttpContext) {
    try {
      await auth.authenticate()
      const user = auth.user!
      const { propertyId } = params

      const isInShop = await AffiliateProperty.query()
        .where('affiliateUserId', user.id)
        .where('propertyId', propertyId)
        .first()

      logger.info(
        'AffiliatesController.isPropertyInShop - Checked if product is in shop successfully'
      )
      return response.created({
        status: 'success',
        message: 'Checked if product is in shop successfully',
        data: isInShop,
      })
    } catch (error) {
      logger.error(
        error,
        'AffiliatesController.isPropertyInShop - - Error in checking if product is in shop'
      )
      return response.internalServerError(getErrorObject(error))
    }
  }

  async myShop({ auth, response, bouncer }: HttpContext) {
    try {
      await auth.authenticate()
      await bouncer.with('UserPolicy').authorize('isAffiliate')

      const user = auth.user!

      const affiliateProperties = await AffiliateProperty.query()
        .where('affiliateUserId', user.id)
        .where('isActive', true)
        .preload('property', (query) => {
          query.preload('files')
        })
        .orderBy('created_at', 'desc')

      const properties = affiliateProperties.map((ap) => ap.property)

      return response.ok({
        success: true,
        message: 'Shop items fetched successfully',
        data: {
          properties,
          products: [],
          totalItems: properties.length,
        },
      })
    } catch (error) {
      console.error('Error in myShop:', error)
      return response.internalServerError(getErrorObject(error))
    }
  }

  async removeFromShop({ auth, request, response }: HttpContext) {
    try {
      await auth.authenticate()
      const user = auth.user!

      const { itemId, itemType } = request.only(['itemId', 'itemType'])

      if (!itemId || !itemType) {
        return response.badRequest({
          status: 'error',
          message: 'Item ID and type are required',
        })
      }

      if (itemType === 'property') {
        await AffiliateProperty.query()
          .where('affiliateUserId', user.id)
          .where('propertyId', itemId)
          .delete()
      } else if (itemType === 'product') {
        // This would depend on your product-affiliate relationship
      } else {
        return response.badRequest({
          status: 'error',
          message: 'Invalid item type',
        })
      }

      return response.ok({
        status: 'success',
        message: 'Item removed from shop successfully',
      })
    } catch (error) {
      console.error('Error in removeFromShop:', error)
      return response.internalServerError(getErrorObject(error))
    }
  }

  async commisionSummary({ auth, response, logger }: HttpContext) {
    try {
      await auth.authenticate()
      const user = auth.user!

      let affiliateWallet = await Wallet.query()
        .where('userId', user.id)
        .where('type', 'affiliate')
        .first()

      if (!affiliateWallet) {
        affiliateWallet = await Wallet.create({
          userId: user.id,
          type: 'affiliate',
        })
      }

      const affiliateTransactions = await db
        .from('transactions')
        .where('userId', user.id)
        .where('type', 'property_purchase')
        .count('*')
        .first()

      logger.info('AffiliatesController.commisionSummary - Commision summary fetched successfully')
      return response.ok({
        status: 'success',
        message: 'Commision summary fetched successfully',
        data: {
          affiliateWallet,
          noOfSales: affiliateTransactions?.count,
        },
      })
    } catch (error) {
      logger.error(
        error,
        'AffiliatesController.commisionSummary - Error in fetching commision summary'
      )
      return response.internalServerError(getErrorObject(error))
    }
  }
}
