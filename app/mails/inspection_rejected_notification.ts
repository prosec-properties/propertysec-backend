import { EMAIL } from '#constants/general'
import { BaseMail } from '@adonisjs/mail'

interface InspectionRejectedData {
  userEmail: string
  userName: string
  propertyTitle: string
  inspectionId: string
  reason?: string
}

export default class InspectionRejectedNotification extends BaseMail {
  from = EMAIL.PROSEC
  subject = 'Inspection Request Update'
  inspectionData: InspectionRejectedData

  constructor(inspectionData: InspectionRejectedData) {
    super()
    this.inspectionData = inspectionData
  }

  /**
   * The "prepare" method is called automatically when
   * the email is sent or queued.
   */
  prepare() {
    this.message
      .to(this.inspectionData.userEmail)
      .subject(`Inspection Request Update - ${this.inspectionData.propertyTitle}`)
      .htmlView('emails/inspection_rejected', {
        userName: this.inspectionData.userName,
        propertyTitle: this.inspectionData.propertyTitle,
        inspectionId: this.inspectionData.inspectionId,
        reason: this.inspectionData.reason || 'No specific reason provided',
        supportEmail: EMAIL.SUPPORT,
      })
  }

  getSubject(): string {
    return this.subject
  }
}