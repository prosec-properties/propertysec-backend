import { errorResponse, getErrorObject } from '#helpers/error'
import { ILoanAmount, ILoanDuration, ILoanFileType } from '#interfaces/loan'
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

      switch (step) {
        case '1':
          return await this.handlePersonalInfo({ request, response, user: auth.user! })
        case '2':
          return await this.handleBankInfo({ request, response, user: auth.user! })
        case '3':
          return await this.handleOfficeInfo({ request, response, user: auth.user! })
        case '4':
          return await this.handleLoanDetails({ request, response, user: auth.user! })
        case '5':
          return await this.handleLandlordInfo({ request, response, user: auth.user! })
        case '6':
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

    const ongoingLoanRequest = await LoanRequest.query()
      .where('userId', user.id)
      .orderBy('createdAt', 'desc')
      .first()

    console.log('ongoingLoanRequest', ongoingLoanRequest?.toJSON())

    let loanRequest

    if (!ongoingLoanRequest || ongoingLoanRequest.status === 'completed') {
      const uploadFiles = await FilesService.uploadFiles(payload.personalImages)
      loanRequest = await LoanRequest.create({
        userId: user.id,
        amount: payload.amount,
        duration: payload.duration,
        status: 'ongoing',
      })

      await this.saveLoanFiles(loanRequest.id, uploadFiles, 'personal_photo', user.id)
    } else {
      loanRequest = await ongoingLoanRequest
        .merge({
          amount: payload.amount,
          duration: payload.duration,
        })
        .save()
    }

    return response.created({
      status: 'success',
      message: 'Personal information saved successfully',
      data: loanRequest,
    })
  }

  private async handleBankInfo({ request, response, user }: HandleStepParams) {
    const payload = await request.validateUsing(bankInfoValidator)
    const bankStatement = await FilesService.uploadFiles(payload.bankStatement)

    const loanRequest = await LoanRequest.findBy('userId', user.id)
    if (!loanRequest) {
      return response.notFound(errorResponse('Loan request not found'))
    }

    const bank = await Bank.updateOrCreate(
      { userId: user.id, contextId: loanRequest.id },
      {
        userId: user.id,
        averageSalary: payload.averageSalary,
        bankName: payload.bankName,
        salaryAccountNumber: payload.salaryAccountNumber,
        nin: payload.nin,
        bvn: payload.bvn,
        contextId: loanRequest.id,
        contextType: 'loan',
      }
    )

    await this.saveLoanFiles(loanRequest.id, bankStatement, 'bank_statement', user.id)

    return response.ok({
      status: 'success',
      message: 'Bank information saved successfully',
      data: bank,
    })
  }

  private async handleOfficeInfo({ request, response, user }: HandleStepParams) {
    const payload = await request.validateUsing(officeInfoValidator)
    const loanRequest = await LoanRequest.findBy('userId', user.id)
    if (!loanRequest) {
      return response.notFound(errorResponse('Loan request not found'))
    }

    const employment = await Employment.updateOrCreate(
      { userId: user.id, contextId: loanRequest.id },
      {
        userId: user.id,
        officeName: payload.officeName,
        employerName: payload.employerName,
        positionInOffice: payload.positionInOffice,
        officeContact: payload.officeContact,
        officeAddress: payload.officeAddress,
        contextId: loanRequest.id,
        contextType: 'loan',
      }
    )

    return response.ok({
      status: 'success',
      message: 'Office information saved successfully',
      data: employment,
    })
  }

  private async handleLoanDetails({ request, response, user }: HandleStepParams) {
    const payload = await request.validateUsing(loanDetailsValidator)
    const uploadFiles = await FilesService.uploadFiles(payload.files)

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

    await this.saveLoanFiles(loanRequest.id, uploadFiles, 'other', user.id)

    return response.ok({
      status: 'success',
      message: 'Loan details saved successfully',
    })
  }

  private async handleLandlordInfo({ request, response, user }: HandleStepParams) {
    const payload = await request.validateUsing(landlordInfoValidator)
    const loanRequest = await LoanRequest.findBy('userId', user.id)
    if (!loanRequest) {
      return response.notFound(errorResponse('Loan request not found'))
    }

    const landlord = await Landlord.updateOrCreate(
      { userId: user.id, contextId: loanRequest.id },
      {
        userId: user.id,
        name: payload.landlordName,
        bankName: payload.landlordBankName,
        accountNumber: payload.landlordAccountNumber,
        address: payload.landlordAddress,
        phoneNumber: payload.landlordPhoneNumber,
        contextId: loanRequest.id,
        contextType: 'loan',
      }
    )

    return response.ok({
      status: 'success',
      message: 'Landlord information saved successfully',
      data: landlord,
    })
  }

  private async handleGuarantorInfo({ request, response, user }: HandleStepParams) {
    const payload = await request.validateUsing(guarantorInfoValidator)
    // console.log('user from guarantor info', user.id)
    const loanRequest = await LoanRequest.findBy('userId', user.id)
    if (!loanRequest) {
      return response.notFound(errorResponse('Loan request not found'))
    }

    // console.log('got here 203')

    const guarantor = await Guarantor.updateOrCreate(
      { userId: user.id, contextId: loanRequest.id },
      {
        userId: user.id,
        name: payload.guarantorName,
        email: payload.guarantorEmail,
        homeAddress: payload.guarantorHomeAddress,
        officeAddress: payload.guarantorOfficeAddress,
        phoneNumber: payload.guarantorPhoneNumber,
        contextId: loanRequest.id,
        contextType: 'loan',
      }
    )


    console.log('userIfd', user.id)

    await Loan.create({
      userId: user.id,
      loanAmount: loanRequest.amount as ILoanAmount,
      loanDuration: loanRequest.duration as ILoanDuration,
      interestRate: 5,
      loanStatus: 'pending',
    })

    await loanRequest.merge({ status: 'completed' }).save()

    return response.ok({
      status: 'success',
      message: 'Guarantor information saved successfully',
      data: guarantor,
    })
  }

  private async saveLoanFiles(
    loanId: string,
    files: ImageUploadInterface[],
    fileType: ILoanFileType,
    userId: string
  ): Promise<void> {
    if (files.length > 0) {
      await Promise.all(
        files.map((file) =>
          LoanFile.create({
            loanId,
            userId,
            fileName: file.metaData.name,
            fileUrl: file.url,
            mediaType: file.metaData.type as 'image' | 'other',
            fileType,
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
