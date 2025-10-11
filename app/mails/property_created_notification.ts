import { EMAIL } from '#constants/general'
import { BaseMail } from '@adonisjs/mail'

interface PropertyCreatedData {
  userEmail: string
  userName: string
  propertyTitle: string
  propertyId: string
}

export default class PropertyCreatedNotification extends BaseMail {
  from = EMAIL.PROSEC
  subject = 'Property Created Successfully'
  propertyData: PropertyCreatedData

  constructor(propertyData: PropertyCreatedData) {
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
      .subject(`Property Created Successfully - ${this.propertyData.propertyTitle}`)
      .htmlView('emails/property_created', {
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