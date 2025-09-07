import vine from '@vinejs/vine'

export const getAuthorizationUrlValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    callbackUrl: vine.string().url(),
    amount: vine.number(),
  })
)
