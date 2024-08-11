import { OTP_LENGTH, RANDOM_OTP_NUMBERS } from '#constants/auth'
import User from '#models/user'
import { customAlphabet } from 'nanoid'
import emailService from '#services/email'
import { FIXED_TIME_VALUES } from '#constants/time'
import Otp from '#models/otp'
import { DateTime } from 'luxon'

export default class UserService {
  static async verifyEmail(user: User) {
    try {
      const otp = customAlphabet(RANDOM_OTP_NUMBERS, OTP_LENGTH)()
      const expiresAt = DateTime.now().plus({ minutes: FIXED_TIME_VALUES.TWENTY_MINUTES })

      const hasExistingOtp = await Otp.findBy('userId', user.id)

      if (hasExistingOtp) {
        await hasExistingOtp.delete()
      }

      await Otp.create({
        userId: user.id,
        expiresAt,
        code: otp,
      })

      await emailService.sendEmailVerificationMail(user.email, otp)
    } catch (error) {
      throw error
    }
  }

  static async emailIsVerified(user: User) {
    try {
      user.emailVerified = true
      user.save()

      const otp = await Otp.findByOrFail('userId', user.id)

      await otp.delete()
    } catch (error) {
      throw error
    }
  }
}
