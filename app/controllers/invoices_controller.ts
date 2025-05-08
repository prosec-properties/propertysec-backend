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

      // Optionally, regenerate PDF URL if needed or ensure it's stored/retrievable
      // For simplicity, assuming invoice model might store enough details or PDF path
      // If PDF needs to be generated on-the-fly like in PaymentsController:
      const pdfBuffer = await pdf.generatePDF({
        type: 'transfer-invoice', // Or a more generic 'invoice' type if you create one
        data: {
          invoice: invoice,
        },
        user,
      })

      const responseData = {
        ...invoice.serialize(),
        pdfUrl: `data:application/pdf;base64,${pdfBuffer.toString('base64')}`,
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
