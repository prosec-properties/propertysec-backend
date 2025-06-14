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
import db from '@adonisjs/lucid/services/db'

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

    // Update user with personal information
    await user.merge({
      fullName: payload.fullName,
      email: payload.email,
      phoneNumber: payload.phoneNumber,
      stateOfOrigin: payload.stateOfOrigin,
      nationality: payload.nationality,
      homeAddress: payload.homeAddress,
      religion: payload.religion,
      nextOfKinName: payload.nextOfKinName,
    }).save()

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

    // Update user with relevant bank information
    await user.merge({
      nin: payload.nin,
      bvn: payload.bvn,
      bankName: payload.bankName,
      bankAccountNumber: payload.salaryAccountNumber,
      monthlySalary: parseFloat(payload.averageSalary) || null,
    }).save()

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
      reasonForFunds: loanRequest.reasonForLoanRequest || '',
      hasCompletedForm: true,
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

  async fetchedLoanRequests({ response, request, auth, bouncer }: HttpContext) {
    try {
      await auth.authenticate()
      await bouncer.with('UserPolicy').authorize('isAdmin')
      const { page = 1, limit = 10 } = request.qs()

      const loans = await Loan.query().preload('user').paginate(page, limit)

      return response.ok({
        success: true,
        message: 'Loan users fetched successfully',
        data: loans,
      })
    } catch (error) {
      return response.badRequest(getErrorObject(error))
    }
  }

  async loanStats({ response, auth, bouncer }: HttpContext) {
    try {
      await auth.authenticate()
      await bouncer.with('UserPolicy').authorize('isAdmin')

      const loanStats = await db.from('loans').count('* as totalLoans').first()

      const approvedLoans = await db
        .query()
        .from('loans')
        .where('loan_status', 'approved')
        .select(db.raw('SUM(CAST(loan_amount AS INTEGER)) as amount'))
        .first()

      const statusCounts = await db
        .from('loans')
        .select('loan_status')
        .count('* as count')
        .select(db.raw('SUM(CAST(loan_amount AS INTEGER)) as totalAmount'))
        .groupBy('loan_status')

      return response.ok({
        success: true,
        message: 'Loan stats fetched successfully',
        data: {
          totalLoans: loanStats.totalLoans,
          totalAmount: loanStats.totalAmount,
          statusCounts,
          approvedLoans: approvedLoans.amount || 0,
        },
      })
    } catch (error) {
      return response.badRequest(getErrorObject(error))
    }
  }

  async approveLoan({ auth, response, params }: HttpContext) {
    try {
      await auth.authenticate()
      const user = auth.user!

      // Check if user is admin
      if (user.role !== 'admin') {
        return response.unauthorized({
          success: false,
          message: 'Unauthorized: Admin access required',
        })
      }

      const loanId = params.id
      const loan = await Loan.find(loanId)

      if (!loan) {
        return response.notFound({
          success: false,
          message: 'Loan not found',
        })
      }

      if (loan.loanStatus !== 'pending') {
        return response.badRequest({
          success: false,
          message: 'Only pending loans can be approved',
        })
      }

      loan.loanStatus = 'approved'
      await loan.save()

      return response.ok({
        success: true,
        message: 'Loan approved successfully',
        data: loan,
      })
    } catch (error) {
      return response.badRequest(getErrorObject(error))
    }
  }

  async rejectLoan({ auth, request, response, params }: HttpContext) {
    try {
      await auth.authenticate()
      const user = auth.user!

      // Check if user is admin
      if (user.role !== 'admin') {
        return response.unauthorized({
          success: false,
          message: 'Unauthorized: Admin access required',
        })
      }

      const loanId = params.id
      const { reason } = request.only(['reason'])

      const loan = await Loan.find(loanId)

      if (!loan) {
        return response.notFound({
          success: false,
          message: 'Loan not found',
        })
      }

      if (loan.loanStatus !== 'pending') {
        return response.badRequest({
          success: false,
          message: 'Only pending loans can be rejected',
        })
      }

      loan.loanStatus = 'rejected'
      // You might want to store the rejection reason in a meta field or separate table
      if (reason) {
        loan.meta = JSON.stringify({ rejectionReason: reason })
      }
      await loan.save()

      return response.ok({
        success: true,
        message: 'Loan rejected successfully',
        data: loan,
      })
    } catch (error) {
      return response.badRequest(getErrorObject(error))
    }
  }

  async getLoanById({ auth, response, params }: HttpContext) {
    try {
      await auth.authenticate()
      const user = auth.user!

      console.log('user from getLoanById', user.id)

      // Check if user is admin
      if (user.role !== 'admin') {
        return response.unauthorized({
          success: false,
          message: 'Unauthorized: Admin access required',
        })
      }

      const loanId = params.id
      const loan = await Loan.query()
        .where('id', loanId)
        .preload('user')
        .preload('files')
        .first()

      if (!loan) {
        return response.notFound({
          success: false,
          message: 'Loan not found',
        })
      }

      // Find the loan request to get the context ID for related data
      const loanRequest = await LoanRequest.query()
        .where('userId', loan.userId)
        .where('status', 'completed')
        .orderBy('createdAt', 'desc')
        .first()

      let relatedData = {}
      if (loanRequest) {
        // Fetch all related data using the loan request ID as context
        const [bank, employment, guarantor, landlord] = await Promise.all([
          Bank.query().where('contextId', loanRequest.id).where('contextType', 'loan').first(),
          Employment.query().where('contextId', loanRequest.id).where('contextType', 'loan').first(),
          Guarantor.query().where('contextId', loanRequest.id).where('contextType', 'loan').first(),
          Landlord.query().where('contextId', loanRequest.id).where('contextType', 'loan').first(),
        ])

        relatedData = {
          loanRequest,
          bank,
          employment,
          guarantor,
          landlord,
        }
      }

      return response.ok({
        success: true,
        data: {
          ...loan.toJSON(),
          ...relatedData,
        },
      })
    } catch (error) {
      return response.badRequest(getErrorObject(error))
    }
  }
}

interface HandleStepParams {
  request: HttpContext['request']
  response: HttpContext['response']
  user: User
}
