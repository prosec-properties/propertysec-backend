import { OTP_LENGTH, RANDOM_OTP_NUMBERS } from '#constants/auth'
import User from '#models/user'
import { customAlphabet } from 'nanoid'
import emailService from '#services/email'
import { FIXED_TIME_VALUES } from '#constants/time'
import Otp from '#models/otp'
import { DateTime } from 'luxon'
import logger from '@adonisjs/core/services/logger'

export default class UserService {
  static async verifyEmail(user: User) {
    const otp = customAlphabet(RANDOM_OTP_NUMBERS, OTP_LENGTH)()
    const expiresAt = DateTime.now().plus({ minutes: FIXED_TIME_VALUES.TWENTY_MINUTES })

    const existingOtp = await Otp.findBy('userId', user.id)

    if (existingOtp) {
      await existingOtp.delete()
    }

    await Otp.create({
      userId: user.id,
      expiresAt,
      code: otp,
    })

    try {
      await emailService.sendEmailVerificationMail(user.email, otp)
    } catch (error) {
      await Otp.query().where('userId', user.id).delete()
      logger.error({ err: error, userId: user.id }, 'Email verification dispatch failed')
      throw error
    }
  }

  static async emailIsVerified(user: User) {
    user.emailVerified = true
    await user.save()

    const otp = await Otp.findBy('userId', user.id)

    if (otp) {
      await otp.delete()
    }

    try {
      await emailService.sendWelcomeMail(user.email, user.fullName || user.email)
    } catch (error) {
      logger.warn({ err: error, userId: user.id }, 'Failed to send welcome email after verification')
    }
  }
}
