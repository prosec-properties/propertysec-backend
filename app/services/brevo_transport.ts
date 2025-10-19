import { basename } from 'node:path'
import { readFile } from 'node:fs/promises'
import got, { HTTPError } from 'got'
import { createTransport } from 'nodemailer'
import { MailResponse, errors } from '@adonisjs/mail'

const { E_MAIL_TRANSPORT_ERROR } = errors

type AddressLike = string | { address?: string; email?: string; name?: string }

interface BrevoTransportConfig {
  key: string
  baseUrl?: string
  sender?: AddressLike
  replyTo?: AddressLike
}

interface AttachmentLike {
  path?: string
  filename?: string
  content?: Buffer | string
}

interface MailData {
  from?: AddressLike
  to?: AddressLike | AddressLike[]
  cc?: AddressLike | AddressLike[]
  bcc?: AddressLike | AddressLike[]
  replyTo?: AddressLike | AddressLike[]
  subject?: string
  html?: string
  text?: string
  attachments?: AttachmentLike[]
}

interface NodeMailerMessage {
  data: MailData
  message: {
    getEnvelope: () => { from?: string; to?: string[] }
    messageId: () => string | undefined
  }
}

type SendCallback = (
  error: Error | null,
  info?: { envelope: ReturnType<NodeMailerMessage['message']['getEnvelope']>; messageId?: string }
) => void

interface NormalizedAddress {
  email: string
  name?: string
}

interface BrevoPayload {
  sender: NormalizedAddress
  to: NormalizedAddress[]
  subject: string
  htmlContent?: string
  textContent?: string
  replyTo?: NormalizedAddress
  cc?: NormalizedAddress[]
  bcc?: NormalizedAddress[]
  attachment?: Array<{ name?: string; content: string }>
}

class NodeMailerTransport {
  public readonly name = 'brevo'
  public readonly version = '1.0.0'
  #config: BrevoTransportConfig

  constructor(config: BrevoTransportConfig) {
    this.#config = config
  }

  #formatAddress(raw: AddressLike | undefined): NormalizedAddress | undefined {
    if (!raw) return undefined

    if (typeof raw === 'string') {
      const email = raw.trim()
      return email ? { email } : undefined
    }

    const email = raw.email?.trim() || raw.address?.trim()
    if (!email) return undefined

    const formatted: NormalizedAddress = { email }
    if (raw.name?.trim()) {
      formatted.name = raw.name.trim()
    }
    return formatted
  }

  #formatAddresses(raw: AddressLike | AddressLike[] | undefined): NormalizedAddress[] {
    const list = Array.isArray(raw) ? raw : raw ? [raw] : []
    return list
      .map((entry) => this.#formatAddress(entry))
      .filter((value): value is NormalizedAddress => Boolean(value))
  }

  #resolveSender(mail: MailData): NormalizedAddress {
    const messageSender = this.#formatAddress(mail.from)
    if (messageSender) {
      if (!messageSender.name) {
        const fallback = this.#formatAddress(this.#config.sender)
        if (fallback?.name) {
          messageSender.name = fallback.name
        }
      }
      return messageSender
    }

    const configuredSender = this.#formatAddress(this.#config.sender)
    if (configuredSender) {
      return configuredSender
    }

    throw new Error('Missing sender email address for Brevo payload')
  }

  #resolveReplyTo(mail: MailData): NormalizedAddress | undefined {
    const replyToList = this.#formatAddresses(mail.replyTo)
    if (replyToList.length) {
      return replyToList[0]
    }

    return this.#formatAddress(this.#config.replyTo)
  }

  async #serializeAttachments(mail: MailData): Promise<BrevoPayload['attachment']> {
    const attachments = mail.attachments
    if (!attachments?.length) {
      return undefined
    }

    const serialized = await Promise.all(
      attachments.map(async (item) => {
        if (item.content) {
          const buffer = Buffer.isBuffer(item.content) ? item.content : Buffer.from(item.content)
          return {
            name: item.filename,
            content: buffer.toString('base64'),
          }
        }

        if (item.path) {
          const fileBuffer = await readFile(item.path)
          return {
            name: item.filename || basename(item.path),
            content: fileBuffer.toString('base64'),
          }
        }

        throw new Error('Brevo transport supports attachments with either content or path')
      })
    )

    return serialized
  }

  async #buildPayload(mail: MailData): Promise<BrevoPayload> {
    const to = this.#formatAddresses(mail.to)
    if (!to.length) {
      throw new Error('Missing recipient email address for Brevo payload')
    }

    const payload: BrevoPayload = {
      sender: this.#resolveSender(mail),
      to,
      subject: mail.subject || '(no subject)',
    }

    if (mail.html) {
      payload.htmlContent = mail.html
    }

    if (mail.text) {
      payload.textContent = mail.text
    }

    const replyTo = this.#resolveReplyTo(mail)
    if (replyTo) {
      payload.replyTo = replyTo
    }

    const cc = this.#formatAddresses(mail.cc)
    if (cc.length) {
      payload.cc = cc
    }

    const bcc = this.#formatAddresses(mail.bcc)
    if (bcc.length) {
      payload.bcc = bcc
    }

    const attachment = await this.#serializeAttachments(mail)
    if (attachment?.length) {
      payload.attachment = attachment
    }

    return payload
  }

  #baseUrl(): string {
    return (this.#config.baseUrl || 'https://api.brevo.com/v3').replace(/\/$/, '')
  }

  async send(mail: NodeMailerMessage, callback: SendCallback) {
    const envelope = mail.message.getEnvelope()

    try {
      const payload = await this.#buildPayload(mail.data)
      const response: { messageId?: string } = await got
        .post(`${this.#baseUrl()}/smtp/email`, {
          responseType: 'json',
          json: payload,
          headers: {
            accept: 'application/json',
            'api-key': this.#config.key,
            'content-type': 'application/json',
          },
        })
        .json()

      const brevoMessageId = response.messageId
      const messageId = brevoMessageId ? brevoMessageId.replace(/^<|>$/g, '') : mail.message.messageId()

      callback(null, { envelope, messageId })
    } catch (error) {
      const normalized = this.#normalizeError(error)
      callback(
        new E_MAIL_TRANSPORT_ERROR('Unable to send email using the Brevo transport', {
          cause: normalized,
        }),
        undefined
      )
    }
  }

  #normalizeError(error: unknown): Error {
    if (error instanceof HTTPError) {
      const status = error.response?.statusCode
      const detail = this.#extractErrorDetail(error)
      const message = detail
        ? `Brevo API responded with status ${status}: ${detail}`
        : `Brevo API responded with status ${status}`
      return new Error(message)
    }

    return error instanceof Error ? error : new Error('Unknown Brevo transport error')
  }

  #extractErrorDetail(error: HTTPError): string | undefined {
    const body = error.response?.body
    if (!body) {
      return undefined
    }

    if (typeof body === 'string') {
      return body
    }

    try {
      return JSON.stringify(body)
    } catch {
      return undefined
    }
  }
}

export class BrevoTransport {
  #config: BrevoTransportConfig

  constructor(config: BrevoTransportConfig) {
    this.#config = config
  }

  async send(message: any, overrides?: BrevoTransportConfig) {
    const transport = new NodeMailerTransport({
      ...this.#config,
      ...overrides,
    })

    const transporter = createTransport(transport as any)
    const response = await transporter.sendMail(message)
    return new MailResponse(response.messageId, response.envelope, response)
  }
}
