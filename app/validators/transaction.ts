import vine from '@vinejs/vine'

export const referenceValidator = vine.compile(
  vine.object({
    reference: vine.string(),
  })
)
