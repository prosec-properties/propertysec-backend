import { getErrorObject } from '#helpers/error'
import ContactMessageNotification from '#mails/contact_message_notification'
import { contactMessageValidator } from '#validators/contact'
import type { HttpContext } from '@adonisjs/core/http'
import mail from '@adonisjs/mail/services/main'

export default class ContactController {
  public async send({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(contactMessageValidator)

      await mail.send(new ContactMessageNotification(payload))

      return response.ok({
        success: true,
        message: 'Thanks for reaching out. Our support team will contact you shortly.',
        data: null,
      })
    } catch (error) {
      return response.badRequest(
        getErrorObject(error, {
          controller: 'ContactController.send',
          message: 'Unable to send your message right now. Please try again later.',
        })
      )
    }
  }
}
