import vine from '@vinejs/vine'


export const createCountryValidator = vine.compile(
    vine.object({
      name: vine.string(),
      meta: vine.string(),
    })
  )
  export const updateCountryValidator = vine.compile(
    vine.object({
      name: vine.string().optional(),
      meta: vine.string().optional(),
    })
  )

export const updateStateValidator = vine.compile(
  vine.object({
    name: vine.string().optional(),
    countryId: vine.string().optional(),
    isActive: vine.boolean().optional(),
    meta: vine.string().optional(),
  })
)

export const createStateValidator = vine.compile(
  vine.object({
    name: vine.string(),
    countryId: vine.string(),
    isActive: vine.boolean(),
    meta: vine.string(),
  })
)

export const updateCityValidator = vine.compile(
  vine.object({
    name: vine.string().optional(),
    stateId: vine.string().optional(),
    isActive: vine.boolean().optional(),
    meta: vine.string().optional(),
  })
)

export const createCityValidator = vine.compile(
  vine.object({
    name: vine.string(),
    stateId: vine.string(),
    isActive: vine.boolean(),
    meta: vine.string(),
  })
)


