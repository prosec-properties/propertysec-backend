import { EMAIL } from '#constants/general'
import { BaseMail } from '@adonisjs/mail'

interface PropertyPublishedData {
  userEmail: string
  userName: string
  propertyTitle: string
  propertyId: string
}

export default class PropertyPublishedNotification extends BaseMail {
  from = EMAIL.PROSEC
  subject = 'Property Published Successfully'
  propertyData: PropertyPublishedData

  constructor(propertyData: PropertyPublishedData) {
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
      .subject(`Your property ${this.propertyData.propertyTitle} has been published`)
      .htmlView('emails/property_published', {
        userName: this.propertyData.userName,
        propertyTitle: this.propertyData.propertyTitle,
        propertyId: this.propertyData.propertyId,
        supportEmail: EMAIL.SUPPORT,
      })
  }

  getSubject(): string {
    return this.subject
  }
}