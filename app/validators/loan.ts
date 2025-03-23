import { ACCEPTED_IMAGE_TYPES } from '#constants/general'
import vine from '@vinejs/vine'

// Common validation rules
const phoneNumberRule = vine.string().mobile()
const emailRule = vine.string().email()
const addressRule = vine.string().minLength(5)
const nameRule = vine.string().minLength(2)

// Step 1: Personal Information Validator
export const personalInfoValidator = vine.compile(
  vine.object({
    fullName: nameRule,
    email: emailRule,
    phoneNumber: phoneNumberRule,
    stateOfOrigin: nameRule,
    nationality: nameRule,
    homeAddress: addressRule,
    religion: vine.enum(['Christian', 'Muslim', 'Traditional', 'Other']),
    nextOfKin: nameRule,

    amount: vine.enum(['1000', '5000', '10000', '20000', '30000', '40000', '50000', '100000']),
    duration: vine.enum(['1 month', '3 months', '6 months', '12 months']),

    personalImages: vine.array(
      vine.file({
        size: '5mb',
        extnames: [...ACCEPTED_IMAGE_TYPES],
      })
    ),
  })
)

// Step 2: Bank Information Validator
export const bankInfoValidator = vine.compile(
  vine.object({
    averageSalary: vine.string(),
    bankName: nameRule,
    salaryAccountNumber: vine.string().minLength(10),
    nin: vine.string().minLength(11),
    bvn: vine.string().minLength(11),
  })
)

// Step 3: Office Information Validator
export const officeInfoValidator = vine.compile(
  vine.object({
    officeName: nameRule,
    employerName: nameRule,
    positionInOffice: nameRule,
    officeContact: phoneNumberRule,
    officeAddress: addressRule,
  })
)

// Step 4: Loan Details Validator
export const loanDetailsValidator = vine.compile(
  vine.object({
    amount: vine.enum(['1000', '5000', '10000', '20000', '30000', '40000', '50000', '100000']),
    duration: vine.enum(['1 month', '3 months', '6 months', '12 months']),
    noOfRooms: vine.number().min(1),
    noOfYears: vine.number().min(0),
    reasonForLoanRequest: vine.string().minLength(10),
  })
)

// Step 5: Landlord Information Validator
export const landlordInfoValidator = vine.compile(
  vine.object({
    landlordName: nameRule,
    landlordBankName: nameRule,
    landlordAccountNumber: vine.string().minLength(10),
    landlordAddress: addressRule,
    landlordPhoneNumber: phoneNumberRule,
  })
)

// Step 6: Guarantor Information Validator
export const guarantorInfoValidator = vine.compile(
  vine.object({
    guarantorName: nameRule,
    guarantorEmail: emailRule,
    guarantorHomeAddress: addressRule,
    guarantorOfficeAddress: addressRule,
    guarantorPhoneNumber: phoneNumberRule,
  })
)
