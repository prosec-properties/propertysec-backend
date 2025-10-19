import vine from '@vinejs/vine'

export const contactMessageValidator = vine.compile(
  vine.object({
    firstName: vine.string().trim().minLength(1),
    lastName: vine.string().trim().minLength(1),
    email: vine.string().email(),
    phoneNumber: vine
      .string()
      .trim()
      .regex(/^(234\d{10}|0\d{10})$/),
    message: vine.string().trim().minLength(1),
  })
)
