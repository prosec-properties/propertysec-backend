import vine from '@vinejs/vine'
import { PRODUCT_CONDITION_ENUMS, PRODUCT_STATUS_ENUMS } from '#interfaces/product'
import { ACCEPTED_IMAGE_TYPES, ACCEPTED_VIDEO_TYPES } from '#constants/general'

export const createProductValidator = vine.compile(
  vine.object({
    // Basic Product Information
    title: vine.string().minLength(3).maxLength(100),
    description: vine.string().minLength(10),
    price: vine.number().positive(),
    condition: vine.enum(PRODUCT_CONDITION_ENUMS),

    // Optional Product Details
    brand: vine.string().maxLength(50).optional(),
    model: vine.string().maxLength(50).optional(),
    specifications: vine.string().optional(),

    // Inventory
    negotiable: vine.boolean().optional(),
    quantity: vine.number().min(1).optional(),

    // Location Information
    // countryId: vine.string().exists(async (db, value) => {
    //   const exists = await db.from('countries').where('id', value).first()
    //   return !!exists
    // }),
    stateId: vine.string().exists(async (db, value) => {
      const exists = await db.from('states').where('id', value).first()
      return !!exists
    }),
    cityId: vine.string().exists(async (db, value) => {
      const exists = await db.from('cities').where('id', value).first()
      return !!exists
    }),

    // Category References
    categoryId: vine.string().exists(async (db, value) => {
      const exists = await db.from('categories').where('id', value).first()
      return !!exists
    }),
    subcategoryId: vine.string().exists(async (db, value) => {
      const exists = await db.from('subcategories').where('id', value).first()
      return !!exists
    }),

    files: vine.array(
      vine.file({
        size: '10mb',
        extnames: [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES],
      })
    ),
  })
)

export const updateProductValidator = vine.compile(
  vine.object({
    // Basic Product Information
    title: vine.string().minLength(3).maxLength(100).optional(),
    description: vine.string().minLength(10).optional(),
    price: vine.number().positive().optional(),
    condition: vine.enum(PRODUCT_CONDITION_ENUMS).optional(),
    status: vine.enum(PRODUCT_STATUS_ENUMS).optional(),

    // Optional Product Details
    brand: vine.string().maxLength(50).optional(),
    model: vine.string().maxLength(50).optional(),
    specifications: vine.string().optional(),

    // Inventory
    negotiable: vine.boolean().optional(),
    quantity: vine.number().min(1).optional(),

    // Location Information
    // countryId: vine
    //   .string()
    //   .exists(async (db, value) => {
    //     const exists = await db.from('countries').where('id', value).first()
    //     return !!exists
    //   })
    //   .optional(),
    stateId: vine
      .string()
      .exists(async (db, value) => {
        const exists = await db.from('states').where('id', value).first()
        return !!exists
      })
      .optional(),
    cityId: vine
      .string()
      .exists(async (db, value) => {
        const exists = await db.from('cities').where('id', value).first()
        return !!exists
      })
      .optional(),

    // Category References
    categoryId: vine
      .string()
      .exists(async (db, value) => {
        const exists = await db.from('categories').where('id', value).first()
        return !!exists
      })
      .optional(),
    subcategoryId: vine
      .string()
      .exists(async (db, value) => {
        const exists = await db.from('sub_categories').where('id', value).first()
        return !!exists
      })
      .optional(),

    // Files
    files: vine
      .array(
        vine.file({
          size: '5mb',
          extnames: ACCEPTED_IMAGE_TYPES,
        })
      )
      .optional(),
  })
)
