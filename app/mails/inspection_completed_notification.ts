import { EMAIL } from '#constants/general'
import { BaseMail } from '@adonisjs/mail'

interface InspectionCompletedData {
  userEmail: string
  userName: string
  propertyTitle: string
  inspectionId: string
  inspectionReport: string
}

export default class InspectionCompletedNotification extends BaseMail {
  from = EMAIL.PROSEC
  subject = 'Inspection Completed'
  inspectionData: InspectionCompletedData

  constructor(inspectionData: InspectionCompletedData) {
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
      .subject(`Inspection Completed - ${this.inspectionData.propertyTitle}`)
      .htmlView('emails/inspection_completed', {
        userName: this.inspectionData.userName,
        propertyTitle: this.inspectionData.propertyTitle,
        inspectionId: this.inspectionData.inspectionId,
        inspectionReport: this.inspectionData.inspectionReport,
        supportEmail: EMAIL.SUPPORT,
      })
  }

  getSubject(): string {
    return this.subject
  }
}