import { ACCEPTED_IMAGE_TYPES } from '#constants/general'
import vine from '@vinejs/vine'

export const updateProfileValidator = vine.compile(
  vine.object({
    phoneNumber: vine
      .string()
      .minLength(11)
      .unique(async (db, value) => {
        const user = await db.from('users').where('phone_number', value).first()
        const isUserPhoneNumber = user?.phone_number === value
        return isUserPhoneNumber || !user
      })
      .optional(),
    newPassword: vine.string().minLength(6).nullable().optional(),
    oldPassword: vine.string().minLength(6).nullable().optional(),
    fullName: vine.string().trim().minLength(3).optional(),

    businessName: vine.string().nullable().optional(),
    businessRegNo: vine.string().nullable().optional(),
    businessAddress: vine.string().nullable().optional(),

    nationality: vine.string().nullable().optional(),
    stateOfResidence: vine.string().nullable().optional(),
    cityOfResidence: vine.string().nullable().optional(),
    homeAddress: vine.string().nullable().optional(),
    stateOfOrigin: vine.string().nullable().optional(),
    nin: vine.string().nullable().optional(),
    bvn: vine.string().nullable().optional(),
    nextOfKin: vine.string().nullable().optional(),
    religion: vine.string().nullable().optional(),

    monthlySalary: vine.number().nullable().optional(),
    bankName: vine.string().nullable().optional(),
    bankAccountNumber: vine.string().nullable().optional(),
    bankAccountName: vine.string().nullable().optional(),
    meta: vine.string().nullable().optional(),

    // files
    approvalAgreement: vine
      .array(
        vine.file({
          size: '10mb',
          extnames: ACCEPTED_IMAGE_TYPES,
        })
      )
      .optional(),
    identificationCard: vine
      .array(
        vine.file({
          size: '10mb',
          extnames: ACCEPTED_IMAGE_TYPES,
        })
      )
      .optional(),
    powerOfAttorney: vine
      .array(
      vine.file({
          size: '10mb',
          extnames: ACCEPTED_IMAGE_TYPES,
        })
      )
      .optional(),
    avatarUrl: vine
      .file({
        size: '10mb',
        extnames: ACCEPTED_IMAGE_TYPES,
      })
      .optional(),
  })
)
