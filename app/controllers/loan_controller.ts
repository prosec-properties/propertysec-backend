import { errorResponse, getErrorObject } from '#helpers/error'
import { calculateLoanDetails, calculateOutstandingBalance, parseLoanDuration } from '#helpers/loan'
import { ILoanAmount, ILoanDuration, ILoanFileType } from '#interfaces/loan'
import Loan from '#models/loan'
import LoanFile from '#models/loan_file'
import LoanRepayment from '#models/loan_repayment'
import Payment from '#models/payment'
import User from '#models/user'
import Employment from '#models/employment'
import Landlord from '#models/landlord'
import Guarantor from '#models/guarantor'
import LoanRequest from '#models/loan_request'
import { ImageUploadInterface } from '#services/azure'
import FilesService from '#services/files'
import PaymentVerificationService from '#services/payment_verification'
import {
  personalInfoValidator,
  bankInfoValidator,
  officeInfoValidator,
  loanDetailsValidator,
  landlordInfoValidator,
  guarantorInfoValidator,
} from '#validators/loan'
import { loanRepaymentValidator, verifyRepaymentValidator } from '#validators/loan_repayment'
import type { HttpContext } from '@adonisjs/core/http'
import Bank from '#models/bank'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import { nanoid } from 'nanoid'

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
      interestRate: 5,
      loanStatus: 'pending',
      reasonForFunds: loanRequest.reasonForLoanRequest || '',
      hasCompletedForm: true,
    })

    console.log('new loan file', loan?.toJSON())

    // Update all loan files to reference the actual loan ID instead of loan request ID
    await LoanFile.query()
      .where('loanId', loanRequest.id)
      .where('userId', user.id)
      .update({ loanId: loan.id })

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

      const loanStats = await db.from('loans').count('* as totalLoans').first()

      const approvedLoans = await db
        .query()
        .from('loans')
        .where('loan_status', 'approved')
        .select(db.raw('SUM(CAST(loan_amount AS INTEGER)) as amount'))
        .first()

      const disbursedLoans = await db
        .query()
        .from('loans')
        .where('loan_status', 'disbursed')
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
          disbursedLoans: disbursedLoans.amount || 0,
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

      const loanId = params.id
      const loan = await Loan.query()
        .where('id', loanId)
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

      return response.ok({
        success: true,
        message: 'User loans fetched successfully',
        data: {
          loans,
          stats: {
            totalLoans: Number(loanStats?.totalLoans || 0),
            totalAmount: Number(loanStats?.totalAmount || 0),
            approvedAmount: Number(loanStats?.approvedAmount || 0),
            disbursedAmount: Number(loanStats?.disbursedAmount || 0),
            pendingAmount: Number(loanStats?.pendingAmount || 0),
            rejectedAmount: Number(loanStats?.rejectedAmount || 0),
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

  async initializeLoanRepayment({ auth, request, response, params }: HttpContext) {
    try {
      await auth.authenticate()
      const user = auth.user!
      const loanId = params.id

      const payload = await request.validateUsing(loanRepaymentValidator)
      const { repaymentAmount, repaymentType = 'PARTIAL', paymentMethod = 'CARD' } = payload

      if (!repaymentAmount || repaymentAmount <= 0) {
        return response.badRequest({
          success: false,
          message: 'Repayment amount must be greater than 0',
        })
      }

      const loan = await Loan.query()
        .where('id', loanId)
        .preload('repayments', (query) => {
          query.where('repaymentStatus', 'SUCCESS')
        })
        .first()

      if (!loan) {
        return response.notFound({
          success: false,
          message: 'Loan not found',
        })
      }

      if (loan.userId !== user.id) {
        return response.unauthorized({
          success: false,
          message: 'Unauthorized: You can only repay your own loans',
        })
      }

      if (loan.loanStatus !== 'disbursed' && loan.loanStatus !== 'overdue') {
        return response.badRequest({
          success: false,
          message: 'Only disbursed loans can be repaid',
        })
      }

      // Calculate outstanding balance
      const loanAmount = parseFloat(loan.loanAmount)
      const totalPaid = loan.repayments.reduce(
        (sum, repayment) => sum + repayment.repaymentAmount,
        0
      )
      const loanDetails = calculateLoanDetails(
        loanAmount,
        loan.interestRate,
        parseLoanDuration(loan.loanDuration)
      )
      const totalDue = loanDetails.totalAmount
      const outstandingBalance = totalDue - totalPaid

      if (outstandingBalance <= 0) {
        return response.badRequest({
          success: false,
          message: 'This loan has been fully repaid',
        })
      }

      if (repaymentAmount > outstandingBalance) {
        return response.badRequest({
          success: false,
          message: `Repayment amount cannot exceed outstanding balance of ₦${outstandingBalance.toFixed(2)}`,
        })
      }

      const paymentReference = `LR_${nanoid(10)}`

      const loanRepayment = await LoanRepayment.create({
        loanId: loan.id,
        userId: user.id,
        repaymentAmount: repaymentAmount,
        repaymentType: repaymentType,
        paymentMethod: paymentMethod,
        paymentReference: paymentReference,
        paymentProvider: 'PAYSTACK',
        repaymentStatus: 'PENDING',
        outstandingBalance: outstandingBalance - repaymentAmount,
        principalAmount: 0, // Will be calculated after successful payment
        interestAmount: 0, // Will be calculated after successful payment
      })

      const responseData = {
        success: true,
        message: 'Loan repayment initialized successfully',
        data: {
          repaymentId: loanRepayment.id,
          loanId: loan.id,
          repaymentAmount: repaymentAmount,
          outstandingBalance: outstandingBalance - repaymentAmount,
          paymentReference: paymentReference,
          paystackConfig: {
            publicKey: process.env.PAYSTACK_PUBLIC_KEY,
            amount: repaymentAmount * 100, // Paystack expects amount in kobo
            email: user.email,
            reference: paymentReference,
            currency: 'NGN',
            metadata: {
              loanId: loan.id,
              repaymentId: loanRepayment.id,
              userId: user.id,
              repaymentType: repaymentType,
            },
          },
        },
      }

      return response.created(responseData)
    } catch (error) {
      return response.badRequest(getErrorObject(error))
    }
  }

  async verifyLoanRepayment({ auth, request, response, params }: HttpContext) {
    try {
      await auth.authenticate()
      const user = auth.user!
      const repaymentId = params.repaymentId

      // Validate request data
      const payload = await request.validateUsing(verifyRepaymentValidator)
      const { paymentReference, providerResponse } = payload

      const loanRepayment = await LoanRepayment.query()
        .where('id', repaymentId)
        .preload('loan')
        .first()

      if (!loanRepayment) {
        return response.notFound({
          success: false,
          message: 'Loan repayment not found',
        })
      }

      // Check if user owns the repayment
      if (loanRepayment.userId !== user.id) {
        return response.unauthorized({
          success: false,
          message: 'Unauthorized: You can only verify your own repayments',
        })
      }

      if (loanRepayment.repaymentStatus !== 'PENDING') {
        return response.badRequest({
          success: false,
          message: 'This repayment has already been processed',
        })
      }

      // Verify payment with payment provider
      const verificationResult = await PaymentVerificationService.verifyPayment(
        loanRepayment.paymentProvider,
        paymentReference
      )

      if (verificationResult.success) {
        // Update repayment status
        loanRepayment.repaymentStatus = 'SUCCESS'
        loanRepayment.repaymentDate = DateTime.now()
        loanRepayment.meta = JSON.stringify({
          providerResponse: verificationResult.data || providerResponse || {},
          verifiedAt: DateTime.now().toISO(),
        })

        // Calculate principal and interest breakdown
        const loan = loanRepayment.loan
        const loanAmount = parseFloat(loan.loanAmount)
        const loanDetails = calculateLoanDetails(
          loanAmount,
          loan.interestRate,
          parseLoanDuration(loan.loanDuration)
        )
        const totalInterest = loanDetails.totalInterest
        const totalPrincipal = loanAmount

        // Simple proportional calculation for principal/interest breakdown
        const interestPortion = totalInterest / loanDetails.totalAmount
        const principalPortion = totalPrincipal / loanDetails.totalAmount

        loanRepayment.interestAmount = loanRepayment.repaymentAmount * interestPortion
        loanRepayment.principalAmount = loanRepayment.repaymentAmount * principalPortion

        await loanRepayment.save()

        // Create payment record
        await Payment.create({
          userId: user.id,
          amount: loanRepayment.repaymentAmount,
          provider: 'PAYSTACK',
          status: 'SUCCESS',
          reference: paymentReference,
          providerResponse: JSON.stringify(verificationResult.data || providerResponse || {}),
          paymentMethod:
            loanRepayment.paymentMethod === 'CASH' ? 'WALLET' : loanRepayment.paymentMethod,
        })

        // Check if loan is fully repaid
        const allRepayments = await LoanRepayment.query()
          .where('loanId', loan.id)
          .where('repaymentStatus', 'SUCCESS')

        const totalPaid = allRepayments.reduce(
          (sum, repayment) => sum + repayment.repaymentAmount,
          0
        )
        const totalDue = loanDetails.totalAmount

        if (totalPaid >= totalDue) {
          loan.loanStatus = 'completed'
          await loan.save()
        }

        return response.ok({
          success: true,
          message: 'Loan repayment verified successfully',
          data: {
            repaymentId: loanRepayment.id,
            amount: loanRepayment.repaymentAmount,
            status: loanRepayment.repaymentStatus,
            outstandingBalance: loanRepayment.outstandingBalance,
            loanStatus: loan.loanStatus,
            isLoanCompleted: loan.loanStatus === 'completed',
          },
        })
      } else {
        // Payment verification failed
        loanRepayment.repaymentStatus = 'FAILED'
        loanRepayment.meta = JSON.stringify({
          providerResponse: verificationResult.data || providerResponse || {},
          errorMessage: verificationResult.message,
          failedAt: DateTime.now().toISO(),
        })
        await loanRepayment.save()

        return response.badRequest({
          success: false,
          message: verificationResult.message || 'Payment verification failed',
        })
      }
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
