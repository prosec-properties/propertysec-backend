import vine from '@vinejs/vine'

export const addToAffiliateShopValidator = vine.compile(
  vine.object({
    propertyId: vine.string().exists(async (db, value) => {
      const exists = await db.from('properties').where('id', value).first()
      return !!exists
    }),
  })
)
