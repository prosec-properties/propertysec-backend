import vine from '@vinejs/vine'

export const updateSettingsValidator = vine.compile(
  vine.object({
    emailNotificationsFeatureUpdates: vine.boolean().optional(),
    emailNotificationsListingUpdates: vine.boolean().optional(),
  })
)
