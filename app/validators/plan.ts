import vine from '@vinejs/vine'

export const UpdatePlanValidator = vine.compile(
  vine.object({
    price: vine.number(),
    discount: vine.number(),
  })
)
