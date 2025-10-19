import { errorResponse, getErrorObject } from '#helpers/error'
import { calculateLoanDetails, calculateOutstandingBalance, parseLoanDuration } from '#helpers/loan'
import { ILoanAmount, ILoanDuration, ILoanFileType } from '#interfaces/loan'
import Loan from '#models/loan'
import LoanFile from '#models/loan_file'
import LoanRepayment from '#models/loan_repayment'
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
import { DateTime } from 'luxon'
import mail from '@adonisjs/mail/services/main'
import LoanApprovedNotification from '#mails/loan_approved_notification'
import LoanRejectedNotification from '#mails/loan_rejected_notification'
import LoanDisbursedNotification from '#mails/loan_disbursed_notification'

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
    await user
      .merge({
        fullName: payload.fullName,
        email: payload.email,
        phoneNumber: payload.phoneNumber,
        stateOfOrigin: payload.stateOfOrigin,
        nationality: payload.nationality,
        homeAddress: payload.homeAddress,
        religion: payload.religion,
        nextOfKinName: payload.nextOfKinName,
      })
      .save()

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
    await user
      .merge({
        nin: payload.nin,
        bvn: payload.bvn,
        bankName: payload.bankName,
        bankAccountNumber: payload.salaryAccountNumber,
        monthlySalary: parseFloat(payload.averageSalary) || null,
      })
      .save()

    const bank = await Bank.updateOrCreate(
      { userId: user.id, contextId: loanRequest.id },
      {
        userId: user.id,
        averageSalary: parseFloat(payload.averageSalary) || 0,
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
    const loanRequest = await LoanRequest.findBy('userId', user.id)
    if (!loanRequest) {
      return response.notFound(errorResponse('Loan request not found'))
    }

    console.log('loanRequest', loanRequest.toJSON())

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

    const loan = await Loan.create({
      userId: user.id,
      loanAmount: loanRequest.amount as ILoanAmount,
      loanDuration: loanRequest.duration as ILoanDuration,
      interestRate: 10,
      loanStatus: 'pending',
      reasonForFunds: loanRequest.reasonForLoanRequest || '',
      hasCompletedForm: true,
    })

    console.log('new loan file', loan?.toJSON())

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
    const validFiles = files.filter((file) => file.url && file.filename)
    if (validFiles.length > 0) {
      await Promise.all(
        validFiles.map((file) =>
          LoanFile.create({
            loanId,
            userId,
            fileName: file.filename,
            fileUrl: file.url,
            mediaType: file.metaData.type.startsWith('image/') ? 'image' : 'other',
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
      const { page = 1, limit = 10, search } = request.qs()

      let query = Loan.query().preload('user').orderBy('created_at', 'desc')

      if (search) {
        query = query.whereHas('user', (userQuery) => {
          userQuery.where((subQuery) => {
            subQuery
              .where('fullName', 'ilike', `%${search}%`)
              .orWhere('email', 'ilike', `%${search}%`)
              .orWhere('phoneNumber', 'ilike', `%${search}%`)
          })
        })
      }

      const loans = await query.paginate(page, limit)

      let baseStatsQuery = Loan.query()

      const [totalLoans, activeLoans, completedLoans] = await Promise.all([
        baseStatsQuery.clone().count('* as total'),
        baseStatsQuery.clone().where('loanStatus', 'approved').count('* as total'),
        baseStatsQuery.clone().where('loanStatus', 'disbursed').count('* as total'),
      ])

      return response.ok({
        success: true,
        message: 'Loan users fetched successfully',
        data: {
          ...loans.toJSON(),
          statistics: {
            totalLoans: totalLoans[0]?.$extras?.total || 0,
            activeLoans: activeLoans[0]?.$extras?.total || 0,
            completedLoans: completedLoans[0]?.$extras?.total || 0,
          },
        },
      })
    } catch (error) {
      return response.badRequest(getErrorObject(error))
    }
  }

  async loanStats({ response, auth, bouncer }: HttpContext) {
    try {
      await auth.authenticate()
      await bouncer.with('UserPolicy').authorize('isAdmin')

      const loanStats = await db
        .from('loans')
        .select(
          db.raw('COUNT(*) as totalLoans'),
          db.raw('COALESCE(SUM(CAST(loan_amount AS INTEGER)), 0) as totalAmount')
        )
        .first()

      const approvedLoans = await db
        .query()
        .from('loans')
        .where('loan_status', 'approved')
        .select(db.raw('SUM(CAST(loan_amount AS INTEGER)) as amount'))
        .first()

      const allDisbursedLoans = await db
        .query()
        .from('loans')
        .where('loan_status', 'disbursed')
        .select('id', 'loan_amount', 'loan_status')

      console.log('All disbursed loans:', allDisbursedLoans)

      const disbursedLoans = await db
        .query()
        .from('loans')
        .where('loan_status', 'disbursed')
        .select(db.raw('COALESCE(SUM(CAST(loan_amount AS INTEGER)), 0) as amount'))
        .first()

      const totalRepaid = await db
        .query()
        .from('loan_repayments')
        .where('repayment_status', 'SUCCESS')
        .select(db.raw('SUM(CAST(repayment_amount AS INTEGER)) as amount'))
        .first()

      const repaidLoanDetails = await db
        .query()
        .from('loan_repayments')
        .where('repayment_status', 'SUCCESS')
        .select(
          db.raw('COUNT(*) as totalRepayments'),
          db.raw('SUM(CAST(repayment_amount AS INTEGER)) as totalRepaidAmount'),
          db.raw('SUM(CAST(principal_amount AS INTEGER)) as totalPrincipalRepaid'),
          db.raw('SUM(CAST(interest_amount AS INTEGER)) as totalInterestRepaid'),
          db.raw('AVG(CAST(repayment_amount AS INTEGER)) as averageRepaymentAmount')
        )
        .first()

      const statusCounts = await db
        .from('loans')
        .select('loan_status')
        .count('* as count')
        .select(db.raw('SUM(CAST(loan_amount AS INTEGER)) as totalAmount'))
        .groupBy('loan_status')

      console.log({ totalRepaid: totalRepaid.amount || 0 })
      console.log({ repaidLoanDetails })

      return response.ok({
        success: true,
        message: 'Loan stats fetched successfully',
        data: {
          totalLoans: loanStats.totalLoans,
          totalAmount: loanStats.totalAmount,
          statusCounts,
          approvedLoans: approvedLoans.amount || 0,
          disbursedLoans: disbursedLoans.amount || 0,
          totalRepaid: totalRepaid.amount || 0,
          repaidLoan: {
            totalRepayments: Number(repaidLoanDetails?.totalrepayments || 0),
            totalRepaidAmount: Number(repaidLoanDetails?.totalrepaidamount || 0),
            totalPrincipalRepaid: Number(repaidLoanDetails?.totalprincipalrepaid || 0),
            totalInterestRepaid: Number(repaidLoanDetails?.totalinterestrepaid || 0),
            averageRepaymentAmount: Number(repaidLoanDetails?.averagerepaymentamount || 0),
          },
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

      // Send email notification to the loan applicant
      const loanUser = await User.findOrFail(loan.userId)
      await mail.send(
        new LoanApprovedNotification({
          userEmail: loanUser.email,
          userName: loanUser.fullName || loanUser.email,
          loanAmount: parseFloat(loan.loanAmount),
          loanId: loan.id,
          loanDuration: loan.loanDuration,
        })
      )

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
      if (reason) {
        loan.meta = JSON.stringify({ rejectionReason: reason })
      }
      await loan.save()

      // Send email notification to the loan applicant
      const loanUser = await User.findOrFail(loan.userId)
      await mail.send(
        new LoanRejectedNotification({
          userEmail: loanUser.email,
          userName: loanUser.fullName || loanUser.email,
          loanAmount: parseFloat(loan.loanAmount),
          loanId: loan.id,
          reason: reason || 'No specific reason provided',
        })
      )

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

      const loanId = params.id
      const loan = await Loan.query()
        .where('id', loanId)
        .preload('user', (userQuery) => {
          userQuery
            .select([
              'id',
              'fullName',
              'email',
              'phoneNumber',
              'role',
              'homeAddress',
              'stateOfOrigin',
              'nationality',
              'religion',
              'nextOfKinName',
              'avatarUrl',
              'hasCompletedProfile',
              'createdAt',
              'updatedAt',
            ])
            .preload('profileFiles', (fileQuery) => {
              fileQuery.select([
                'id',
                'userId',
                'fileUrl',
                'fileName',
                'fileType',
                'fileCategory',
                'meta',
                'createdAt',
                'updatedAt',
              ])
            })
        })
        .preload('files')
        .preload('repayments')
        .first()

      if (!loan) {
        return response.notFound({
          success: false,
          message: 'Loan not found',
        })
      }

      // Check if user is admin or owns the loan
      if (user.role !== 'admin' && loan.userId !== user.id) {
        return response.unauthorized({
          success: false,
          message: 'Unauthorized: You can only access your own loans',
        })
      }

      // Find the loan request to get the context ID for related data
      const loanRequest = await LoanRequest.query()
        .where('userId', loan.userId)
        .where('status', 'completed')
        .preload('files')
        .orderBy('createdAt', 'desc')
        .first()

      let relatedData = {}
      if (loanRequest) {
        // Fetch all related data using the loan request ID as context
        const [bank, employment, guarantor, landlord] = await Promise.all([
          Bank.query().where('contextId', loanRequest.id).where('contextType', 'loan').first(),
          Employment.query()
            .where('contextId', loanRequest.id)
            .where('contextType', 'loan')
            .first(),
          Guarantor.query().where('contextId', loanRequest.id).where('contextType', 'loan').first(),
          Landlord.query().where('contextId', loanRequest.id).where('contextType', 'loan').first(),
        ])

        relatedData = {
          loanRequest: loanRequest.serialize(),
          bank: bank ? bank.serialize() : null,
          employment: employment ? employment.serialize() : null,
          guarantor: guarantor ? guarantor.serialize() : null,
          landlord: landlord ? landlord.serialize() : null,
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

  async getUserLoans({ auth, response, request }: HttpContext) {
    try {
      await auth.authenticate()
      const user = auth.user!
      const { page = 1, limit = 10 } = request.qs()

      const loans = await Loan.query()
        .where('userId', user.id)
        .preload('user', (userQuery) => {
          userQuery.select([
            'id',
            'fullName',
            'email',
            'phoneNumber',
            'role',
            'homeAddress',
            'stateOfOrigin',
            'nationality',
            'religion',
            'nextOfKinName',
            'avatarUrl',
            'hasCompletedProfile',
            'createdAt',
            'updatedAt',
          ])
        })
        .preload('files')
        .orderBy('createdAt', 'desc')
        .paginate(page, limit)

      // Calculate loan statistics for the user
      const loanStats = await db
        .from('loans')
        .where('user_id', user.id)
        .select(
          db.raw('COUNT(*) as totalLoans'),
          db.raw('COALESCE(SUM(CAST(loan_amount AS INTEGER)), 0) as totalAmount'),
          db.raw(
            "COALESCE(SUM(CASE WHEN loan_status = 'approved' THEN CAST(loan_amount AS INTEGER) ELSE 0 END), 0) as approvedAmount"
          ),
          db.raw(
            "COALESCE(SUM(CASE WHEN loan_status = 'disbursed' THEN CAST(loan_amount AS INTEGER) ELSE 0 END), 0) as disbursedAmount"
          ),
          db.raw(
            "COALESCE(SUM(CASE WHEN loan_status = 'pending' THEN CAST(loan_amount AS INTEGER) ELSE 0 END), 0) as pendingAmount"
          ),
          db.raw(
            "COALESCE(SUM(CASE WHEN loan_status = 'rejected' THEN CAST(loan_amount AS INTEGER) ELSE 0 END), 0) as rejectedAmount"
          )
        )
        .first()

      // Calculate repayment statistics for the user
      const userRepaidLoanDetails = await db
        .query()
        .from('loan_repayments')
        .where('user_id', user.id)
        .where('repayment_status', 'SUCCESS')
        .select(
          db.raw('COUNT(*) as totalRepayments'),
          db.raw('SUM(CAST(repayment_amount AS INTEGER)) as totalRepaidAmount'),
          db.raw('SUM(CAST(principal_amount AS INTEGER)) as totalPrincipalRepaid'),
          db.raw('SUM(CAST(interest_amount AS INTEGER)) as totalInterestRepaid'),
          db.raw('AVG(CAST(repayment_amount AS INTEGER)) as averageRepaymentAmount')
        )
        .first()

      return response.ok({
        success: true,
        message: 'User loans fetched successfully',
        data: {
          loans,
          stats: {
            totalLoans: Number(loanStats?.totalloans || 0),
            totalAmount: Number(loanStats?.totalamount || 0),
            approvedAmount: Number(loanStats?.approvedamount || 0),
            disbursedAmount: Number(loanStats?.disbursedamount || 0),
            pendingAmount: Number(loanStats?.pendingamount || 0),
            rejectedAmount: Number(loanStats?.rejectedamount || 0),
            repaidLoan: {
              totalRepayments: Number(userRepaidLoanDetails?.totalrepayments || 0),
              totalRepaidAmount: Number(userRepaidLoanDetails?.totalrepaidamount || 0),
              totalPrincipalRepaid: Number(userRepaidLoanDetails?.totalprincipalrepaid || 0),
              totalInterestRepaid: Number(userRepaidLoanDetails?.totalinterestrepaid || 0),
              averageRepaymentAmount: Number(userRepaidLoanDetails?.averagerepaymentamount || 0),
            },
          },
        },
      })
    } catch (error) {
      return response.badRequest(getErrorObject(error))
    }
  }

  async disburseLoan({ auth, request, response, params }: HttpContext) {
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
      const { disbursementMethod, disbursementDetails, disbursementAmount } = request.only([
        'disbursementMethod',
        'disbursementDetails',
        'disbursementAmount',
      ])

      const loan = await Loan.find(loanId)

      if (!loan) {
        return response.notFound({
          success: false,
          message: 'Loan not found',
        })
      }

      if (loan.loanStatus !== 'approved') {
        return response.badRequest({
          success: false,
          message: 'Only approved loans can be disbursed',
        })
      }

      // Validate disbursement amount matches loan amount
      if (disbursementAmount && parseFloat(disbursementAmount) !== parseFloat(loan.loanAmount)) {
        return response.badRequest({
          success: false,
          message: 'Disbursement amount must match the approved loan amount',
        })
      }

      // Update loan status to disbursed and store disbursement details
      const disbursementData = {
        disbursedBy: user.id,
        disbursedAt: new Date().toISOString(),
        disbursementMethod: disbursementMethod || 'bank_transfer',
        disbursementDetails: disbursementDetails || '',
        disbursementAmount: disbursementAmount || loan.loanAmount,
      }

      loan.loanStatus = 'disbursed'

      // Store disbursement metadata
      const existingMeta = loan.meta ? JSON.parse(loan.meta) : {}
      loan.meta = JSON.stringify({
        ...existingMeta,
        disbursement: disbursementData,
      })

      await loan.save()

      // Send email notification to the loan applicant
      const loanUser = await User.findOrFail(loan.userId)
      const disbursementDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
      await mail.send(
        new LoanDisbursedNotification({
          userEmail: loanUser.email,
          userName: loanUser.fullName || loanUser.email,
          loanAmount: parseFloat(loan.loanAmount),
          loanId: loan.id,
          disbursementDate,
        })
      )

      return response.ok({
        success: true,
        message: 'Loan disbursed successfully',
        data: {
          ...loan.toJSON(),
          disbursementInfo: disbursementData,
        },
      })
    } catch (error) {
      return response.badRequest(getErrorObject(error))
    }
  }

  async getLoanRepaymentDetails({ auth, response, params }: HttpContext) {
    try {
      await auth.authenticate()
      const user = auth.user!
      const loanId = params.id

      const loan = await Loan.query()
        .where('id', loanId)
        .preload('user')
        .preload('repayments')
        .first()

      if (!loan) {
        return response.notFound({
          success: false,
          message: 'Loan not found',
        })
      }

      // Check if user owns the loan or is admin
      if (user.role !== 'admin' && loan.userId !== user.id) {
        return response.unauthorized({
          success: false,
          message: 'Unauthorized: You can only access your own loans',
        })
      }

      if (loan.loanStatus !== 'disbursed' && loan.loanStatus !== 'overdue') {
        return response.badRequest({
          success: false,
          message: 'Only disbursed loans can be repaid',
        })
      }

      const loanAmount = parseFloat(loan.loanAmount)
      const interestRate = loan.interestRate
      const durationInMonths = parseLoanDuration(loan.loanDuration)

      const meta = loan.meta ? JSON.parse(loan.meta) : {}
      const disbursementDate = meta.disbursement?.disbursedAt
        ? DateTime.fromISO(meta.disbursement.disbursedAt)
        : loan.createdAt

      const totalPaid = loan.repayments
        .filter((repayment) => repayment.repaymentStatus === 'SUCCESS')
        .reduce((sum, repayment) => sum + repayment.repaymentAmount, 0)

      const outstandingDetails = calculateOutstandingBalance(
        loanAmount,
        totalPaid,
        interestRate,
        durationInMonths,
        disbursementDate
      )

      const loanDetails = calculateLoanDetails(loanAmount, interestRate, durationInMonths)

      const expectedEndDate = disbursementDate.plus({ months: durationInMonths })
      const isOverdue = DateTime.now() > expectedEndDate && outstandingDetails.totalOutstanding > 0

      if (isOverdue && loan.loanStatus !== 'overdue') {
        loan.loanStatus = 'overdue'
        await loan.save()
      }

      return response.ok({
        success: true,
        data: {
          loan: {
            id: loan.id,
            loanAmount: loanAmount,
            interestRate: interestRate,
            loanDuration: loan.loanDuration,
            loanStatus: loan.loanStatus,
            disbursementDate: disbursementDate.toISO(),
            expectedEndDate: expectedEndDate.toISO(),
            isOverdue,
          },
          repaymentDetails: {
            totalAmountDue: loanDetails.totalAmount,
            totalPaid,
            outstandingPrincipal: outstandingDetails.outstandingPrincipal,
            outstandingInterest: outstandingDetails.outstandingInterest,
            penaltyAmount: outstandingDetails.penaltyAmount,
            totalOutstanding: outstandingDetails.totalOutstanding,
            monthlyPayment: loanDetails.monthlyPayment,
          },
          repaymentHistory: loan.repayments.map((repayment) => ({
            id: repayment.id,
            amount: repayment.repaymentAmount,
            type: repayment.repaymentType,
            status: repayment.repaymentStatus,
            paymentMethod: repayment.paymentMethod,
            paymentReference: repayment.paymentReference,
            repaymentDate: repayment.repaymentDate?.toISO(),
            createdAt: repayment.createdAt.toISO(),
          })),
        },
      })
    } catch (error) {
      return response.badRequest(getErrorObject(error))
    }
  }

  /**
   * Get user's loan repayment history
   */
  async getUserLoanRepayments({ auth, response, request }: HttpContext) {
    try {
      await auth.authenticate()
      const user = auth.user!
      const { page = 1, limit = 10, loanId } = request.qs()

      let query = LoanRepayment.query()
        .where('userId', user.id)
        .preload('loan', (loanQuery) => {
          loanQuery.select(['id', 'loanAmount', 'loanDuration', 'loanStatus'])
        })
        .orderBy('createdAt', 'desc')

      if (loanId) {
        query = query.where('loanId', loanId)
      }

      const repayments = await query.paginate(page, limit)

      return response.ok({
        success: true,
        message: 'Loan repayments fetched successfully',
        data: repayments,
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
