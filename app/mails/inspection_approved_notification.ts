import { EMAIL } from '#constants/general'
import { BaseMail } from '@adonisjs/mail'

interface InspectionApprovedData {
  userEmail: string
  userName: string
  propertyTitle: string
  inspectionId: string
  inspectionAmount: number
}

export default class InspectionApprovedNotification extends BaseMail {
  from = EMAIL.PROSEC
  subject = 'Inspection Request Approved'
  inspectionData: InspectionApprovedData

  constructor(inspectionData: InspectionApprovedData) {
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
      .subject(`Inspection Request Approved - ${this.inspectionData.propertyTitle}`)
      .htmlView('emails/inspection_approved', {
        userName: this.inspectionData.userName,
        propertyTitle: this.inspectionData.propertyTitle,
        inspectionId: this.inspectionData.inspectionId,
        inspectionAmount: this.inspectionData.inspectionAmount,
        supportEmail: EMAIL.SUPPORT,
      })
  }

  getSubject(): string {
    return this.subject
  }
}