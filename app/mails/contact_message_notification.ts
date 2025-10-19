import { EMAIL } from '#constants/general'
import { BaseMail } from '@adonisjs/mail'

export interface ContactMessagePayload {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  message: string
}

export default class ContactMessageNotification extends BaseMail {
  from = EMAIL.PROSEC
  subject = 'New contact form submission'
  private contactData: ContactMessagePayload

  constructor(contactData: ContactMessagePayload) {
    super()
    this.contactData = contactData
  }

  prepare() {
    this.message
      .to(EMAIL.SUPPORT)
      .replyTo(this.contactData.email)
      .subject(
        `New contact message from ${this.contactData.firstName} ${this.contactData.lastName}`
      )
      .htmlView('emails/contact_message', {
        ...this.contactData,
      })
  }
}
