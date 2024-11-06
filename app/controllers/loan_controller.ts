import { errorResponse, getErrorObject } from '#helpers/error'
import Loan from '#models/loan'
import LoanFile from '#models/loan_file'
import User from '#models/user'
import { ImageUploadInterface } from '#services/azure'
import FilesService from '#services/files'
import { loanInfoValidator } from '#validators/loan'
import { MultipartFile } from '@adonisjs/core/bodyparser'
import type { HttpContext } from '@adonisjs/core/http'

enum LOANSTEPS {
  LOAN_STEP_1 = '1',
  BANK_STEP_2 = '2',
  OFFICE_STEP_3 = '3',
  OTHER_STEP_4 = '4',
  LANDLORD_STEP_5 = '5',
  GUARANTOR_STEP_6 = '6',
}

interface ILoanPayload {
  amount: string
  duration: string
  nationality?: string
  nextOfKinName?: string
  stateOfOrigin?: string
  religion?: 'Christian' | 'Muslim' | 'Traditional' | 'Other'
  homeAddress?: string
  personalImages: MultipartFile[]
}

export default class LoansController {
  async initializeObtainLoan({ auth, request, response, logger }: HttpContext) {
    try {
      await auth.authenticate()
      const { step } = request.qs()

      const user = auth.user!

      if (step === LOANSTEPS.LOAN_STEP_1) {
        const payload = await request.validateUsing(loanInfoValidator)

        this.validateUserDetails(payload, user, response)
        await this.updateUserDetails(user, payload)

        const uploadFiles = await FilesService.uploadFiles(payload.personalImages)

        console.log('uploadFiles', uploadFiles)

        const loan = await Loan.create({
          loanAmount: payload.amount,
          loanDuration: payload.duration,
          interestRate: 5,
          loanStatus: 'pending',
        })

        await this.saveLoanFiles(loan.id, uploadFiles)
      }
    } catch (error) {
      logger.error(getErrorObject(error))
      return response.badRequest(getErrorObject(error))
    }
  }

  async saveLoanFiles(loanId: string, files: ImageUploadInterface[]): Promise<void> {
    if (files.length > 0) {
      await Promise.all(
        files.map((file) =>
          LoanFile.create({
            loanId,
            fileUrl: file.url,
            fileType: file.metaData.type as 'image' | 'other',
            meta: JSON.stringify(file.metaData),
          })
        )
      )
    }
  }

  private validateUserDetails(
    payload: ILoanPayload,
    user: User,
    response: HttpContext['response']
  ): void {
    const requiredFields = [
      { field: 'nationality', message: 'Please provide your nationality' },
      {
        field: 'stateOfOrigin',
        message: 'Please provide your state of origin',
      },
      { field: 'religion', message: 'Please provide your religion' },
      { field: 'homeAddress', message: 'Please provide your home address' },
      { field: 'nextOfKinName', message: 'Please provide next of kin details' },
    ] as const

    for (const { field, message } of requiredFields) {
      if (!payload?.[field] && !user?.[field]) {
        return response.badRequest(errorResponse(message))
      }
    }
  }

  private async updateUserDetails(user: User, payload: ILoanPayload): Promise<void> {
    Object.assign(user, {
      nationality: payload.nationality ?? user.nationality,
      stateOfOrigin: payload.stateOfOrigin ?? user.stateOfOrigin,
      religion: payload.religion ?? user.religion,
      homeAddress: payload.homeAddress ?? user.homeAddress,
      nextOfKinName: payload.nextOfKinName ?? user.nextOfKinName,
    })
    await user.save()
  }
}
