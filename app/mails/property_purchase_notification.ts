import { COMPANY_EMAIL } from '#constants/general'
import { BaseMail } from '@adonisjs/mail'

interface PropertyPurchaseData {
  buyerName: string
  buyerEmail: string
  propertyTitle: string
  propertyAddress: string
  purchaseAmount: number
  currency: string
  transactionReference: string
  purchaseDate: string
}

export default class PropertyPurchaseNotification extends BaseMail {
  from = COMPANY_EMAIL
  subject = 'Property Purchase Confirmation'
  purchaseData: PropertyPurchaseData

  constructor(purchaseData: PropertyPurchaseData) {
    super()
    this.purchaseData = purchaseData
  }

  /**
   * The "prepare" method is called automatically when
   * the email is sent or queued.
   */
  prepare() {
    this.message
      .to(this.purchaseData.buyerEmail)
      .subject(`Property Purchase Confirmation - ${this.purchaseData.propertyTitle}`)
      .htmlView('emails/property_purchase_confirmation', {
        buyerName: this.purchaseData.buyerName,
        propertyTitle: this.purchaseData.propertyTitle,
        propertyAddress: this.purchaseData.propertyAddress,
        purchaseAmount: this.purchaseData.purchaseAmount,
        currency: this.purchaseData.currency,
        transactionReference: this.purchaseData.transactionReference,
        purchaseDate: this.purchaseData.purchaseDate,
      })
  }

  getSubject(): string {
    return this.subject
  }
}
