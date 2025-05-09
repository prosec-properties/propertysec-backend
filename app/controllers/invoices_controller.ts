import type { HttpContext } from '@adonisjs/core/http'
import Invoice from '#models/invoice'
import { getErrorObject } from '#helpers/error'
import pdf from '#services/pdf'
import User from '#models/user'

export default class InvoicesController {
  async getInvoice({ auth, request, response }: HttpContext) {
    try {
      await auth.authenticate()
      const user = auth.user! as User
      const { invoiceId } = request.params()

      if (!invoiceId) {
        return response.badRequest({
          success: false,
          message: 'Invoice ID is required',
        })
      }

      const invoice = await Invoice.query()
        .where('id', invoiceId)
        .where('user_id', user.id)
        .first()

      if (!invoice) {
        return response.notFound({
          success: false,
          message: 'Invoice not found or access denied',
        })
      }

      const pdfBuffer = await pdf.generatePDF({
        type: 'transfer-invoice',
        data: {
          invoice: invoice,
        },
        user,
      })

      const responseData = {
        ...invoice.serialize(),
        pdfUrl: `data:application/pdf;base64,${pdfBuffer.toString()}`,
      }

      return response.ok({
        success: true,
        message: 'Invoice retrieved successfully',
        data: responseData,
      })
    } catch (error) {
      return response.badRequest(getErrorObject(error))
    }
  }
}
