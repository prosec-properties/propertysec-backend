import { getErrorObject } from '#helpers/error'
import type { HttpContext } from '@adonisjs/core/http'
import InspectionDetail from '#models/inspection_detail'
import vine from '@vinejs/vine'

export default class InspectionDetailsController {
  async store({ request, auth, response, logger }: HttpContext) {
    try {
      await auth.authenticate()
      const user = auth.user!
      const payload = await request.validateUsing(
        vine.compile(
          vine.object({
            inspectionReport: vine.string(),
            propertyId: vine.string(),
            name: vine.string().minLength(3),
            email: vine.string().email(),
            phoneNumber: vine.string().mobile().minLength(11),
          })
        )
      )

      const inspectionDetails = await InspectionDetail.create({
        ...payload,
        userId: user.id,
        inspectionStatus: 'PENDING',
      })

      return response.ok({
        success: true,
        message: 'Inspection details created successfully!',
        inspectionDetails,
      })
    } catch (error) {
      logger.error('Error creating inspection details', error)
      return response.badRequest(getErrorObject(error))
    }
  }

  async index({ auth, request, response, logger }: HttpContext) {
    try {
      await auth.authenticate()
      const isAdmin = auth.user!.role === 'admin'

      const { page = 1, limit = 10, status, search } = request.qs()

      const query = InspectionDetail.query()
        .preload('user', (userQuery) => {
          userQuery.select(['id', 'fullName', 'email', 'phoneNumber'])
        })
        .preload('property', (propertyQuery) => {
          propertyQuery.select(['id', 'title', 'address', 'price'])
        })
        .orderBy('createdAt', 'desc')

      // If not admin, only show user's own inspections
      if (!isAdmin) {
        query.where('userId', auth.user!.id)
      }

      if (status) {
        query.where('inspectionStatus', status.toUpperCase())
      }

      if (search) {
        query.where((builder) => {
          builder
            .whereHas('user', (userQuery) => {
              userQuery
                .where('fullName', 'ILIKE', `%${search}%`)
                .orWhere('email', 'ILIKE', `%${search}%`)
            })
            .orWhereHas('property', (propertyQuery) => {
              propertyQuery
                .where('title', 'ILIKE', `%${search}%`)
                .orWhere('address', 'ILIKE', `%${search}%`)
            })
        })
      }

      const inspections = await query.paginate(page, limit)

      const formattedInspections = inspections.toJSON()

      const transformedData = formattedInspections.data.map((inspection) => {
        return {
          id: inspection.id,
          userId: inspection.userId,
          propertyId: inspection.propertyId,
          user: inspection.user,
          property: inspection.property,
          status: inspection.inspectionStatus === 'COMPLETED' ? 'paid' : 'pending',
          amount: inspection.inspectionAmount,
          inspectionStatus: inspection.inspectionStatus,
          approvalStatus: inspection.approvalStatus || 'pending',
          inspectionReport: inspection.inspectionReport,
          paymentDate: inspection.createdAt,
          createdAt: inspection.createdAt,
          updatedAt: inspection.updatedAt,
          name: inspection.name,
          email: inspection.email,
          phoneNumber: inspection.phoneNumber,
        }
      })

      return response.ok({
        success: true,
        message: 'Inspection payments fetched successfully!',
        data: transformedData,
        meta: {
          total: formattedInspections.meta.total,
          per_page: formattedInspections.meta.per_page,
          current_page: formattedInspections.meta.current_page,
          last_page: formattedInspections.meta.last_page,
          first_page: formattedInspections.meta.first_page,
          first_page_url: formattedInspections.meta.first_page_url,
          last_page_url: formattedInspections.meta.last_page_url,
          next_page_url: formattedInspections.meta.next_page_url,
          previous_page_url: formattedInspections.meta.previous_page_url,
        },
      })
    } catch (error) {
      logger.error('Error fetching inspection payments', error)
      return response.badRequest(getErrorObject(error))
    }
  }

  async show({ auth, params, response, logger }: HttpContext) {
    try {
      await auth.authenticate()

      const { id } = params

      if (!id) {
        return response.badRequest({
          success: false,
          message: 'Inspection ID is required',
        })
      }

      const inspection = await InspectionDetail.query()
        .where('id', id)
        .preload('user', (userQuery) => {
          userQuery.select(['id', 'fullName', 'email', 'phoneNumber'])
        })
        .preload('property', (propertyQuery) => {
          propertyQuery.select(['id', 'title', 'address', 'price'])
        })
        .firstOrFail()

      // Check if user has permission to view this inspection
      const isAdmin = auth.user!.role === 'admin'
      if (!isAdmin && inspection.userId !== auth.user!.id) {
        return response.forbidden({
          success: false,
          message: 'You do not have permission to view this inspection',
        })
      }

      // Transform to match frontend interface
      const transformedData = {
        id: inspection.id,
        userId: inspection.userId,
        propertyId: inspection.propertyId,
        user: inspection.user,
        property: inspection.property,
        status: inspection.inspectionStatus,
        amount: inspection.inspectionAmount,
        inspectionStatus: inspection.inspectionStatus,
        inspectionReport: inspection.inspectionReport,
        paymentDate: inspection.createdAt,
        createdAt: inspection.createdAt,
        updatedAt: inspection.updatedAt,
        name: inspection.name,
        email: inspection.email,
        phoneNumber: inspection.phoneNumber,
      }

      return response.ok({
        success: true,
        message: 'Inspection payment fetched successfully!',
        data: transformedData,
      })
    } catch (error) {
      logger.error('Error fetching inspection payment', error)
      return response.badRequest(getErrorObject(error))
    }
  }

  async updateApprovalStatus({ auth, params, request, response, logger }: HttpContext) {
    try {
      await auth.authenticate()
      const user = auth.user!

      // Verify user is admin
      if (user.role !== 'admin') {
        return response.forbidden({
          success: false,
          message: 'Only administrators can approve or reject inspection requests',
        })
      }

      const { id } = params
      if (!id) {
        return response.badRequest({
          success: false,
          message: 'Inspection ID is required',
        })
      } // Validate request body
      const payload = await request.validateUsing(
        vine.compile(
          vine.object({
            inspectionStatus: vine.string().in(['approved', 'rejected']),
          })
        )
      )

      const inspection = await InspectionDetail.findOrFail(id)

      if (payload.inspectionStatus === 'approved') {
        inspection.inspectionStatus = 'COMPLETED'
      } else {
        inspection.inspectionStatus = 'PENDING'
      }

      await inspection.save()

      return response.ok({
        success: true,
        message: `Inspection request ${payload.inspectionStatus} successfully!`,
        data: {
          id: inspection.id,
          inspectionStatus: inspection.inspectionStatus,
        },
      })
    } catch (error) {
      logger.error('Error updating inspection approval status', error)
      return response.badRequest(getErrorObject(error))
    }
  }
}
