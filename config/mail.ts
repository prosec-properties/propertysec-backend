import env from '#start/env'
import { defineConfig } from '@adonisjs/mail'
import { configProvider } from '@adonisjs/core'

const supportEmail = env.get('SUPPORT_EMAIL', '')
const defaultFromAddress = env.get('EMAIL_FROM_ADDRESS')
const defaultFromName = env.get('EMAIL_FROM_NAME', 'Prosec Properties')

const brevoConfig = {
  key: env.get('BREVO_API_KEY'),
  baseUrl: env.get('BREVO_BASE_URL', 'https://api.brevo.com/v3'),
  sender: {
    address: defaultFromAddress,
    name: defaultFromName,
  },
  replyTo: supportEmail || undefined,
}

const mailConfig = defineConfig({
  default: 'brevo',

  /**
   * The mailers object can be used to configure multiple mailers
   * each using a different transport or same transport with different
   * options.
   */
  mailers: {
    brevo: configProvider.create(async () => {
      const { BrevoTransport } = await import('#services/brevo_transport')
      return () => new BrevoTransport(brevoConfig)
    }),
  },

  from: {
    address: defaultFromAddress,
    name: defaultFromName,
  },
  replyTo: supportEmail || undefined,
})

export default mailConfig
