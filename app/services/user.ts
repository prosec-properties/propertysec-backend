import { OTP_LENGTH, RANDOM_OTP_NUMBERS, REDIS_VERIFY_EMAIL_PREFIX } from '#constants/auth'
import User from '#models/user'
import { customAlphabet } from 'nanoid'
import emailService from '#services/email'
import redis from '@adonisjs/redis/services/main'
import { FIXED_TIME_VALUES } from '#constants/time'

export default class UserService {
  static async verifyEmail(user: User) {
    try {
      const otp = customAlphabet(RANDOM_OTP_NUMBERS, OTP_LENGTH)()

      await emailService.sendEmailVerificationMail(user.email, otp)

      await redis.setex(
        `${REDIS_VERIFY_EMAIL_PREFIX}${user.id}`,
        FIXED_TIME_VALUES.TWENTY_MINUTES,
        otp
      )
    } catch (error) {
      throw error
    }
  }

  static async emailIsVerified(user: User) {
    try {
      user.emailVerified = true
      user.save()

      await redis.del(`${REDIS_VERIFY_EMAIL_PREFIX}${user.id}`)
    } catch (error) {
      throw error
    }
  }
}
