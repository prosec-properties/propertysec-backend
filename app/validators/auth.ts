import vine from '@vinejs/vine'

export const registerUserValidator = vine.compile(
  vine.object({
    firstName: vine.string().trim().minLength(3),
    lastName: vine.string().minLength(3),
    email: vine
      .string()
      .email()
      .normalizeEmail()
      .unique(async (db, value) => {
        const match = await db.from('users').where('email', value).first()
        return !match
      }),
    password: vine.string().minLength(6),
  })
)

export const loginUserValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
    password: vine.string().minLength(6),
  })
)