import { ACCEPTED_IMAGE_TYPES } from '#constants/general'
import vine from '@vinejs/vine'

export const loanApplicantValidator = vine.compile(
  vine.object({
    // amount: vine
    //   .enum(['1000', '5000', '10000', '20000', '30000', '40000', '50000', '100000'])
    //   .optional(),
    // duration: vine.enum(['1 month', '3 months', '6 months', '12 months']).optional(),

    // nationality: vine.string().optional(),
    // nextOfKin: vine.string().optional(),
    // stateOfOrigin: vine.string().optional(),
    // religion: vine.string().optional(),
    // homeAddress: vine.string().optional(),

    companyAddress: vine.string().optional(),
    companyName: vine.string().optional(),
    companyPosition: vine.string().optional(),
    companyPhoneNumber: vine.string().optional(),
    companyEmail: vine.string().optional(),

    yearsInApartment: vine.number().optional(),
    numberOfRooms: vine.number().optional(),
    reasonForFunds: vine.string().optional(),

    landlordName: vine.string().optional(),
    landlordPhoneNumber: vine.string().mobile().optional(),
    landlordEmail: vine.string().email().optional(),
    landlordAddress: vine.string().optional(),
    landlordBankName: vine.string().optional(),
    landlordBankAccountNumber: vine.string().optional(),
    landlordBankAccountName: vine.string().optional(),

    guarantorName: vine.string().optional(),
    guarantorPhoneNumber: vine.string().mobile().optional(),
    guarantorEmail: vine.string().email().optional(),
    guarantorHomeAddress: vine.string().optional(),
    guarantorOfficeAddress: vine.string().optional(),

    step: vine.enum([
      'LOAN_STEP_1',
      'BANK_STEP_2',
      'OFFICE_STEP_3',
      'OTHER_STEP_4',
      'LANDLORD_STEP_5',
      'GUARANTOR_STEP_6',
    ]),
  })
)

export const loanInfoValidator = vine.compile(
  vine.object({
    amount: vine.enum(['1000', '5000', '10000', '20000', '30000', '40000', '50000', '100000']),
    duration: vine.enum(['1 month', '3 months', '6 months', '12 months']),
    nationality: vine.string().optional(),
    nextOfKinName: vine.string().optional(),
    stateOfOrigin: vine.string().optional(),
    religion: vine.enum(['Christian', 'Muslim', 'Traditional', 'Other']).optional(),
    homeAddress: vine.string().optional(),
    personalImages: vine.array(
      vine.file({
        size: '5mb',
        extnames: [...ACCEPTED_IMAGE_TYPES],
      })
    ),
  })
)
