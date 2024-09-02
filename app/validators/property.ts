import { ACCEPTED_IMAGE_TYPES } from '#constants/general'
import vine from '@vinejs/vine'
import { PROPERTY_TYPE_ENUMS } from '../interfaces/property.js'
import { CURRENCIES_ENUM } from '#interfaces/payment'
import { ACCEPTED_VIDEO_TYPES } from '../constants/general.js'

export const createPropertyValidator = vine.compile(
  vine.object({
    title: vine.string().minLength(3),
    description: vine.string().minLength(10),
    type: vine.enum(PROPERTY_TYPE_ENUMS),
    price: vine.number(),
    currency: vine.enum(CURRENCIES_ENUM),
    address: vine.string(),
    bedrooms: vine.number(),
    bathrooms: vine.number(),
    toilets: vine.number(),
    street: vine.string(),
    append: vine.string(),

    stateId: vine.string().exists(async (db, value) => {
      const state = await db.from('states').where('id', value).first()
      return !!state
    }),
    cityId: vine.string().exists(async (db, value) => {
      const city = await db.from('cities').where('id', value).first()
      return !!city
    }),
    categoryId: vine.string().exists(async (db, value) => {
      const category = await db.from('categories').where('id', value).first()
      return !!category
    }),
    files: vine.array(

      vine.file({
        size: '10mb',
        extnames: [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES],
      })
    ),
  })
)
