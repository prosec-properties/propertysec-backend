import vine from '@vinejs/vine'

export const subscribeNewsletterValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
  })
)
