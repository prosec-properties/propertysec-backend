import env from '#start/env'
import { defineConfig, transports } from '@adonisjs/mail'

const supportEmail = env.get('SUPPORT_EMAIL', '')

const mailConfig = defineConfig({
  default: 'brevo',

  /**
   * The mailers object can be used to configure multiple mailers
   * each using a different transport or same transport with different
   * options.
   */
  mailers: {
    brevo: transports.brevo({
      key: env.get('BREVO_API_KEY'),
      baseUrl: env.get('BREVO_BASE_URL', 'https://api.brevo.com/v3'),
    }),
  },

  from: env.get('EMAIL_FROM_ADDRESS'),
  replyTo: supportEmail || undefined,
})

export default mailConfig
