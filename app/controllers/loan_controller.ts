import { errorResponse, getErrorObject } from '#helpers/error'
import { ILoanAmount, ILoanDuration } from '#interfaces/loan'
import Loan from '#models/loan'
import LoanFile from '#models/loan_file'
import User from '#models/user'
import Employment from '#models/employment'
import Landlord from '#models/landlord'
import Guarantor from '#models/guarantor'
import LoanRequest from '#models/loan_request'
import { ImageUploadInterface } from '#services/azure'
import FilesService from '#services/files'
import {
  personalInfoValidator,
  bankInfoValidator,
  officeInfoValidator,
  loanDetailsValidator,
  landlordInfoValidator,
  guarantorInfoValidator,
} from '#validators/loan'
import type { HttpContext } from '@adonisjs/core/http'
import Bank from '#models/bank'

export default class LoansController {
  async processLoanStep({ auth, request, response, logger }: HttpContext) {
    try {
      await auth.authenticate()
      const step = request.input('step')
      const data = request.all()

      switch (step) {
        case '1':
          await personalInfoValidator.validate(data)
          return await this.handlePersonalInfo({ request, response, user: auth.user! })
        case '2':
          await bankInfoValidator.validate(data)
          return await this.handleBankInfo({ request, response, user: auth.user! })
        case '3':
          await officeInfoValidator.validate(data)
          return await this.handleOfficeInfo({ request, response, user: auth.user! })
        case '4':
          await loanDetailsValidator.validate(data)
          return await this.handleLoanDetails({ request, response, user: auth.user! })
        case '5':
          await landlordInfoValidator.validate(data)
          return await this.handleLandlordInfo({ request, response, user: auth.user! })
        case '6':
          await guarantorInfoValidator.validate(data)
          return await this.handleGuarantorInfo({ request, response, user: auth.user! })
        default:
          return response.badRequest(errorResponse('Invalid step'))
      }
    } catch (error) {
      logger.error(getErrorObject(error))
      return response.badRequest({
        status: 'error',
        message: 'Failed to process loan application step',
        error: getErrorObject(error),
      })
    }
  }

  private async handlePersonalInfo({ request, response, user }: HandleStepParams) {
    const payload = await request.validateUsing(personalInfoValidator)
    const uploadFiles = await FilesService.uploadFiles(payload.personalImages)

    const loanRequest = await LoanRequest.create({
      userId: user.id,
      amount: payload.amount,
      duration: payload.duration,
    })

    await this.saveLoanFiles(loanRequest.id, uploadFiles)

    return response.created({
      status: 'success',
      message: 'Personal information saved successfully',
      data: loanRequest,
    })
  }

  private async handleBankInfo({ request, response, user }: HandleStepParams) {
    const payload = await request.validateUsing(bankInfoValidator)
    const existingBank = await Bank.findBy('userId', user.id)
    let bank

    if (existingBank) {
      bank = await existingBank
        .merge({
          averageSalary: payload.averageSalary,
          bankName: payload.bankName,
          salaryAccountNumber: payload.salaryAccountNumber,
          nin: payload.nin,
          bvn: payload.bvn,
        })
        .save()
    } else {
      bank = await Bank.create({
        userId: user.id,
        averageSalary: payload.averageSalary,
        bankName: payload.bankName,
        salaryAccountNumber: payload.salaryAccountNumber,
        nin: payload.nin,
        bvn: payload.bvn,
      })
    }

    return response.ok({
      status: 'success',
      message: 'Bank information saved successfully',
      data: bank,
    })
  }

  private async handleOfficeInfo({ request, response, user }: HandleStepParams) {
    const payload = await request.validateUsing(officeInfoValidator)
    const existingEmployment = await Employment.findBy('userId', user.id)
    let employment

    if (existingEmployment) {
      employment = await existingEmployment
        .merge({
          officeName: payload.officeName,
          employerName: payload.employerName,
          positionInOffice: payload.positionInOffice,
          officeContact: payload.officeContact,
          officeAddress: payload.officeAddress,
        })
        .save()
    } else {
      employment = await Employment.create({
        userId: user.id,
        officeName: payload.officeName,
        employerName: payload.employerName,
        positionInOffice: payload.positionInOffice,
        officeContact: payload.officeContact,
        officeAddress: payload.officeAddress,
      })
    }

    return response.ok({
      status: 'success',
      message: 'Office information saved successfully',
      data: employment,
    })
  }

  private async handleLoanDetails({ request, response, user }: HandleStepParams) {
    const payload = await request.validateUsing(loanDetailsValidator)

    const loanRequest = await LoanRequest.findBy('userId', user.id)
    if (!loanRequest) {
      return response.notFound(errorResponse('Loan request not found'))
    }

    await loanRequest
      .merge({
        noOfRooms: String(payload.noOfRooms),
        noOfYears: String(payload.noOfYears),
        reasonForLoanRequest: payload.reasonForLoanRequest,
      })
      .save()

    return response.ok({
      status: 'success',
      message: 'Loan details saved successfully',
    })
  }

  private async handleLandlordInfo({ request, response, user }: HandleStepParams) {
    const payload = await request.validateUsing(landlordInfoValidator)
    const existingLandlord = await Landlord.findBy('userId', user.id)
    let landlord

    if (existingLandlord) {
      landlord = await existingLandlord
        .merge({
          name: payload.landlordName,
          bankName: payload.landlordBankName,
          accountNumber: payload.landlordAccountNumber,
          address: payload.landlordAddress,
          phoneNumber: payload.landlordPhoneNumber,
        })
        .save()
    } else {
      landlord = await Landlord.create({
        userId: user.id,
        name: payload.landlordName,
        bankName: payload.landlordBankName,
        accountNumber: payload.landlordAccountNumber,
        address: payload.landlordAddress,
        phoneNumber: payload.landlordPhoneNumber,
      })
    }

    return response.ok({
      status: 'success',
      message: 'Landlord information saved successfully',
      data: landlord,
    })
  }

  private async handleGuarantorInfo({ request, response, user }: HandleStepParams) {
    const payload = await request.validateUsing(guarantorInfoValidator)
    const existingGuarantor = await Guarantor.findBy('userId', user.id)
    let guarantor

    if (existingGuarantor) {
      guarantor = await existingGuarantor
        .merge({
          name: payload.guarantorName,
          email: payload.guarantorEmail,
          homeAddress: payload.guarantorHomeAddress,
          officeAddress: payload.guarantorOfficeAddress,
          phoneNumber: payload.guarantorPhoneNumber,
        })
        .save()
    } else {
      guarantor = await Guarantor.create({
        userId: user.id,
        name: payload.guarantorName,
        email: payload.guarantorEmail,
        homeAddress: payload.guarantorHomeAddress,
        officeAddress: payload.guarantorOfficeAddress,
        phoneNumber: payload.guarantorPhoneNumber,
      })
    }

    const loanRequest = await LoanRequest.findBy('userId', user.id)

    if (!loanRequest) {
      return response.notFound(errorResponse('Loan request not found'))
    }

    await Loan.create({
      userId: user.id,
      loanAmount: loanRequest.amount as ILoanAmount,
      loanDuration: loanRequest.duration as ILoanDuration,
      interestRate: 5,
      loanStatus: 'pending',
    })

    return response.ok({
      status: 'success',
      message: 'Guarantor information saved successfully',
      data: guarantor,
    })
  }

  private async saveLoanFiles(loanId: string, files: ImageUploadInterface[]): Promise<void> {
    if (files.length > 0) {
      await Promise.all(
        files.map((file) =>
          LoanFile.create({
            loanId,
            fileUrl: file.url,
            mediaType: file.metaData.type as 'image' | 'other',
            meta: JSON.stringify(file.metaData),
          })
        )
      )
    }
  }
}

interface HandleStepParams {
  request: HttpContext['request']
  response: HttpContext['response']
  user: User
}
