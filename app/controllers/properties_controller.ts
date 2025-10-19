import { getErrorObject } from '#helpers/error'
import Property from '#models/property'
import { createPropertyValidator, updatePropertyValidator } from '#validators/property'
import type { HttpContext } from '@adonisjs/core/http'
import FilesService from '#services/files'
import PropertyFile from '#models/property_file'
import { MultipartFile } from '@adonisjs/core/bodyparser'
import { NIGERIA_COUNTRY_ID } from '#constants/general'
import vine from '@vinejs/vine'
import Subscription from '#models/subscription'
import User from '#models/user'
import aws from '#services/aws'
import mail from '@adonisjs/mail/services/main'
import PropertyCreatedNotification from '#mails/property_created_notification'
import PropertyPublishedNotification from '#mails/property_published_notification'
import PropertyRejectedNotification from '#mails/property_rejected_notification'
import PropertyService from '#services/property'

export default class PropertiesController {
  private getPropertyLimit(planName: string): number {
    switch (planName) {
      case 'FREE':
        return 3 // Allow up to 3 for free users
      case 'SILVER':
        return 10
      case 'GOLD':
        return 30
      case 'PLATINUM':
        return 60
      case 'UNLIMITED':
        return Infinity
      default:
        return 3 // Default to free limit
    }
  }
  async index({ response, request, logger, auth }: HttpContext) {
    try {
  const page = Number(request.input('page', 1)) || 1
  const limit = Number(request.input('limit', 20)) || 20

      const { status, categories, locations, pricing, search } = request.qs()

      const isLoggedIn = await auth.check()
      const user = isLoggedIn ? auth.user! : null
      const isAdmin = user?.role === 'admin'

      const responseData = await PropertyService.fetchProperties({
        page,
        limit,
        filters: {
          status,
          categories,
          locations,
          pricing,
          search,
        },
        isAdmin: !!isAdmin,
      })

      logger.info('Properties fetched and ranked successfully')
      return response.ok({
        success: true,
        message: 'Properties fetched successfully',
        data: responseData,
      })
    } catch (error) {
      console.error(error)
      return response.badRequest(getErrorObject(error))
    }
  }
  async store({ auth, request, response, logger, bouncer }: HttpContext) {
    try {
      await auth.authenticate()
      const authenticatedUser = auth.user!
      await bouncer.with('UserPolicy').authorize('canUploadProperties')

      // Check if admin is creating property for another user
      const targetUserId = request.input('userId')
      let targetUserIdForProperty = authenticatedUser.id
      let targetUserSubscriptionStatus = authenticatedUser.subscriptionStatus
      let targetUserSubscriptionId = authenticatedUser.subscriptionId

      if (targetUserId && authenticatedUser.role === 'admin') {
        const foundUser = await User.findOrFail(targetUserId)
        targetUserIdForProperty = foundUser.id
        targetUserSubscriptionStatus = foundUser.subscriptionStatus
        targetUserSubscriptionId = foundUser.subscriptionId
      }

      const currentPropertyCount = await Property.query()
        .where('userId', targetUserIdForProperty)
        .count('* as total')

      const userPlan =
        targetUserSubscriptionStatus === 'active' && targetUserSubscriptionId
          ? await Subscription.query().where('id', targetUserSubscriptionId).preload('plan').first()
          : null

      const planName = userPlan?.plan?.name || 'FREE'
      const propertyLimit = this.getPropertyLimit(planName)

      if (currentPropertyCount[0].$extras.total >= propertyLimit) {
        return response.forbidden({
          success: false,
          message: `You have reached your property upload limit (${propertyLimit}). Please upgrade your subscription to upload more properties.`,
        })
      }

      const isSubscribed = targetUserSubscriptionStatus === 'active'
      const { files, ...payload } = await request.validateUsing(createPropertyValidator)

      const propertyExists = await Property.query()
        .where('userId', targetUserIdForProperty)
        .andWhere('title', payload.title)
        .andWhere('categoryId', payload.categoryId)
        .first()

      if (propertyExists) {
        return response.badRequest({
          success: false,
          message: 'You have already created a property with this title in the same category.',
        })
      }

      if (files && Array.isArray(files)) {
        for (const file of files) {
          if (file.type?.startsWith('video/') && !isSubscribed) {
            return response.forbidden({
              success: false,
              message: 'Only subscribed users can upload videos.',
            })
          }
          if (file.type === 'image' && file.size > 5 * 1024 * 1024) {
            return response.badRequest({
              success: false,
              message: 'Image file size should not exceed 5mb',
            })
          }
        }

        const results = await FilesService.uploadFiles(files)

        if (!results.length) {
          return response.badRequest({
            success: false,
            message: 'Failed to upload one or more property images',
          })
        }

        let property: Property | null = null
        try {
          property = await Property.create({
            ...payload,
            status: 'draft',
            userId: targetUserIdForProperty,
            availability: 'available',
            views: 0,
            countryId: NIGERIA_COUNTRY_ID,
            defaultImageUrl: results[0].url,
          })

          const uploadedFiles = results.map(({ filename, url, metaData }) => {
            let fileType: 'image' | 'video' | 'other' = 'other'
            if (metaData.type.startsWith('image/')) {
              fileType = 'image'
            } else if (metaData.type.startsWith('video/')) {
              fileType = 'video'
            }
            return {
              fileName: filename,
              fileUrl: url,
              fileType,
              propertyId: property?.id,
              meta: JSON.stringify(metaData),
            }
          })

          try {
            for (const fileInfo of uploadedFiles) {
              await FilesService.createPropertyFile(fileInfo as PropertyFile)
            }
          } catch (error) {
            console.log('my errrroooorrrr', error)
            if (property) {
              await property.delete()
            }
            return response.badRequest({
              success: false,
              message: 'Failed to save property images',
            })
          }

          logger.info('Property created successfully')

          // Send email notification to the property owner
          const propertyOwner = await User.findOrFail(targetUserIdForProperty)

          await mail.send(
            new PropertyCreatedNotification({
              userEmail: propertyOwner.email,
              userName: propertyOwner.fullName || propertyOwner.email,
              propertyTitle: property.title,
              propertyId: property.id,
            })
          )

          return response.created({
            success: true,
            message: 'Property created successfully',
            data: property,
          })
        } catch (error) {
          return response.badRequest(getErrorObject(error))
        }
      }

      return response.badRequest({
        success: false,
        message: 'Property images are required',
      })
    } catch (error) {
      return response.badRequest(getErrorObject(error))
    }
  }

  async show({ logger, response, params, auth }: HttpContext) {
    try {
      let user = auth?.user
      try {
        user = await auth.authenticate()
      } catch (error) {}

      const property = await Property.query()
        .where('id', params.id)
        .if(!!user, (query) => {
          query.preload('inspections', (q) => {
            q.where('userId', user!.id)
          })
        })
        .preload('files')
        .preload('user')
        .preload('category')
        .preload('state')
        .firstOrFail()

      if (property.status === 'published' && property.userId !== auth.user?.id) {
        await property.merge({ views: property.views + 1 }).save()
      }
      logger.info('Property fetched successfully')

      return response.ok({
        success: true,
        message: 'Property fetched successfully',
        data: property,
      })
    } catch (error) {
      return response.badRequest(getErrorObject(error))
    }
  }

  async update({ logger, response, request, params, auth, bouncer }: HttpContext) {
    try {
      await auth.authenticate()
      const user = auth.user!
      await bouncer.with('UserPolicy').authorize('canUploadProperties')

      const isSubscribed = user.subscriptionStatus === 'active'

      const property = await Property.findOrFail(params.id)

      if (property.availability === 'sold') {
        return response.forbidden({
          success: false,
          message: 'Cannot edit a property that has been sold.',
        })
      }

      const payload = await request.validateUsing(updatePropertyValidator)

      if (!payload) {
        return response.badRequest({
          success: false,
          message: 'Invalid payload',
        })
      }

      const existingFiles = await property.related('files').query()

      const newFiles: MultipartFile[] = []

      if (payload.files && Array.isArray(payload.files)) {
        for (const file of payload.files) {
          if (file.type?.startsWith('video/') && !isSubscribed) {
            return response.forbidden({
              success: false,
              message: 'Only subscribed users can upload videos.',
            })
          }
          if (file.type?.startsWith('image/') && file.size > 5 * 1024 * 1024) {
            return response.badRequest({
              success: false,
              message: 'Image file size should not exceed 5MB',
            })
          }

          const fileExists = existingFiles.some(
            (existingFile) => existingFile.fileName === file.clientName
          )

          if (!fileExists) {
            newFiles.push(file)
          }
        }

        if (newFiles.length > 0) {
          const results = await FilesService.uploadFiles(newFiles)

          const uploadedFiles: any = []

          results.forEach(({ filename, url, metaData }) => {
            if (!url || !filename) return
            let fileType: 'image' | 'video' | 'other' = 'other'
            if (metaData.type.startsWith('image/')) {
              fileType = 'image'
            } else if (metaData.type.startsWith('video/')) {
              fileType = 'video'
            }
            uploadedFiles.push({
              fileName: filename,
              fileUrl: url,
              fileType,
              propertyId: property.id,
              meta: JSON.stringify(metaData),
            })
          })

          if (uploadedFiles.length > 0) {
            for (const fileInfo of uploadedFiles) {
              await FilesService.createPropertyFile(fileInfo as PropertyFile)
            }
          }

          if (results.length > 0) {
            property.defaultImageUrl = results[0].url
          }
        }
      }

      // Handle removed images
      if (payload.removedImages && Array.isArray(payload.removedImages)) {
        for (const imageId of payload.removedImages) {
          const imageToDelete = await PropertyFile.find(imageId)
          if (imageToDelete) {
            // Delete the file from storage
            await aws.deleteFile(imageToDelete.fileName)
            // Delete the record
            await imageToDelete.delete()
          }
        }
      }

      const { files: _, removedImages: __, ...restPayload } = payload
      await property.merge(restPayload).save()

      logger.info('Property updated successfully')
      return response.ok({
        success: true,
        message: 'Property updated successfully',
        data: property,
      })
    } catch (error) {
      logger.error(error)
      return response.badRequest(getErrorObject(error))
    }
  }

  async myProperties({ auth, response, request, logger, bouncer }: HttpContext) {
    try {
      await auth.authenticate()
      const user = auth.user!
      await bouncer.with('UserPolicy').authorize('canUploadProperties')

      const page = request.input('page', 1)
      const limit = request.input('limit', 10)

      const { status, categories, locations, pricing, search } = request.qs()

      const properties = await Property.query()
        .if(status, (query) => {
          if (status === 'sold') {
            query.where('availability', 'sold')
          } else {
            query.where('status', status)
            query.where('availability', '!=', 'sold')
          }
        })
        .if(search, (query) => {
          query.where('title', 'ilike', `%${search}%`)
        })
        .if(categories, (query) => {
          const parsedCategories = JSON.parse(categories)
          if (Array.isArray(parsedCategories)) {
            query.whereIn('categoryId', parsedCategories)
          }
        })
        .if(locations, (query) => {
          const parsedLocations = JSON.parse(locations)
          if (Array.isArray(parsedLocations)) {
            query.whereIn('stateId', parsedLocations)
          }
        })
        .if(pricing, (query) => {
          const parsedPricing = JSON.parse(pricing)
          // Check if pricing is an array
          const pricingArray = Array.isArray(parsedPricing) ? parsedPricing : [parsedPricing]

          // Process each pricing filter
          pricingArray.forEach((priceFilter) => {
            // Extract the numeric part and the operator (+ or -)
            const match = priceFilter.match(/(\d+)([+-])/)

            if (match) {
              const [, priceValue, operator] = match
              const price = parseInt(priceValue, 10)

              if (operator === '+') {
                // Price above the specified value
                query.where('price', '>=', price)
              } else if (operator === '-') {
                // Price below the specified value
                query.where('price', '<=', price)
              }
            }
          })
        })
        .where('userId', user.id)
        .preload('files')
        .preload('category')
        .preload('state')
        .orderBy('created_at', 'desc')
        .paginate(page, limit)

      logger.info('Properties fetched successfully')

      return response.ok({
        success: true,
        message: 'Properties fetched successfully',
        data: properties.toJSON(),
      })
    } catch (error) {
      response.badRequest(getErrorObject(error))
    }
  }

  async destroy({ auth, logger, response, params, bouncer }: HttpContext) {
    try {
      await auth.authenticate()
      await bouncer.with('UserPolicy').authorize('canUploadProperties')

      const property = await Property.findOrFail(params.id)

      if (property.availability === 'sold') {
        return response.badRequest({
          success: false,
          message: 'Cannot delete a sold property',
        })
      }

      // Delete associated files and inspections first
      await property.related('files').query().delete()
      await property.related('inspections').query().delete()

      await property.delete()
      logger.info('Property deleted successfully')
      return response.ok({
        success: true,
        message: 'Property deleted successfully',
      })
    } catch (error) {
      response.badRequest(getErrorObject(error))
    }
  }

  async updatePropertyStatus({ auth, bouncer, logger, response, request, params }: HttpContext) {
    try {
      await auth.authenticate()
      await bouncer.with('UserPolicy').authorize('isAdmin')

      const { status, reason } = await vine
        .compile(
          vine.object({
            status: vine.enum(['published', 'rejected']),
            reason: vine.string().optional().requiredWhen('status', '=', 'rejected'),
          })
        )
        .validate(request.body())

      const property = await Property.findOrFail(params.id)
      const propertyUser = await User.findOrFail(property.userId)

      const propertyMeta = property.meta ? JSON.parse(property.meta) : {}

      await property
        .merge({
          status,
          meta: JSON.stringify({
            ...propertyMeta,
            rejectedReason: reason,
          }),
        })
        .save()

      // Send email notification based on status
      if (status === 'published') {
        await mail.send(
          new PropertyPublishedNotification({
            userEmail: propertyUser.email,
            userName: propertyUser.fullName || propertyUser.email,
            propertyTitle: property.title,
            propertyId: property.id,
          })
        )
      } else if (status === 'rejected') {
        await mail.send(
          new PropertyRejectedNotification({
            userEmail: propertyUser.email,
            userName: propertyUser.fullName || propertyUser.email,
            propertyTitle: property.title,
            propertyId: property.id,
            reason: reason || 'No reason provided',
          })
        )
      }

      logger.info('Property status updated successfully')
      return response.ok({
        success: true,
        message: 'Property status updated successfully',
        data: property,
      })
    } catch (error) {
      response.badRequest(getErrorObject(error))
    }
  }
}
