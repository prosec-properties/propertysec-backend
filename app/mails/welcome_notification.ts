import { EMAIL_TEMPLATES } from '#constants/auth'
import { EMAIL } from '#constants/general'
import { BaseMail } from '@adonisjs/mail'

interface WelcomeMailData {
  email: string
  userName: string
}

export default class WelcomeNotification extends BaseMail {
  private data: WelcomeMailData
  from = EMAIL.PROSEC
  subject = 'Welcome to Prosec Properties!'

  constructor(data: WelcomeMailData) {
    super()
    this.data = data
  }

  prepare() {
    this.message
      .to(this.data.email)
      .from(this.from)
      .subject(this.subject)
      .htmlView(EMAIL_TEMPLATES.WELCOME_EMAIL, {
        userName: this.data.userName,
        supportEmail: EMAIL.SUPPORT,
      })
  }
}
