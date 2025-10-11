import { EMAIL } from '#constants/general'
import { BaseMail } from '@adonisjs/mail'

interface PropertyRejectedData {
  userEmail: string
  userName: string
  propertyTitle: string
  propertyId: string
  reason: string
}

export default class PropertyRejectedNotification extends BaseMail {
  from = EMAIL.PROSEC
  subject = 'Property Review Update'
  propertyData: PropertyRejectedData

  constructor(propertyData: PropertyRejectedData) {
    super()
    this.propertyData = propertyData
  }

  /**
   * The "prepare" method is called automatically when
   * the email is sent or queued.
   */
  prepare() {
    this.message
      .to(this.propertyData.userEmail)
      .subject(`Property Review Update - ${this.propertyData.propertyTitle}`)
      .htmlView('emails/property_rejected', {
        userName: this.propertyData.userName,
        propertyTitle: this.propertyData.propertyTitle,
        propertyId: this.propertyData.propertyId,
        reason: this.propertyData.reason,
        supportEmail: EMAIL.SUPPORT,
      })
  }

  getSubject(): string {
    return this.subject
  }
}