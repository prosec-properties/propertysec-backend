import { ACCEPTED_IMAGE_TYPES } from '#constants/general'
import vine from '@vinejs/vine'
import { IPropertyTypes } from '../interfaces/property.js'

export const createPropertyValidator = vine.compile(
  vine.object({
    title: vine.string(),
    description: vine.string(),
    type: vine.enum(IPropertyTypes),
    price: vine.number(),
    currency: vine.string(),
    address: vine.string(),
    bedrooms: vine.number(),
    bathrooms: vine.number(),
    toilets: vine.number(),
    street: vine.string(),
    append: vine.string(),

    state: vine.string().exists(async (db, value) => {
      const state = await db.from('states').where('id', value).first()
      return !!state
    }),
    city: vine.string().exists(async (db, value) => {
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
        extnames: ACCEPTED_IMAGE_TYPES,
      })
    ),
  })
)
