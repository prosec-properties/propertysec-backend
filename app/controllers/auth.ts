import User from '#models/user'
import emailService from '#services/email'
import {
  emailValidator,
  loginUserValidator,
  registerUserValidator,
  resetPasswordValidator,
} from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'
import { customAlphabet } from 'nanoid'
import redis from '@adonisjs/redis/services/main'
import {
  EMAIL_TEMPLATES,
  OTP_LENGTH,
  RANDOM_OTP_NUMBERS,
  REDIS_RESET_PASSWORD_PREFIX,
  REDIS_VERIFY_EMAIL_PREFIX,
} from '#constants/auth'
import { FIXED_TIME_VALUES } from '#constants/time'
import { errorResponse, getErrorObject } from '#helpers/error'

export default class AuthController {
  async register({ request, response }: HttpContext) {
    const payload = await request.validateUsing(registerUserValidator)
    try {
      const userExists = await User.findBy('email', payload.email)

      if (userExists) {
        console.log('userExists', userExists)
        return response.badRequest(errorResponse('User already exists. Please login'))
      }

      const user = await User.create(payload)

      const token = await User.accessTokens.create(user, ['*'], {
        expiresIn: '15 minutes',
      })

      if (!token) {
        return response.abort(errorResponse('Error creating token'))
      }

      const otp = customAlphabet(RANDOM_OTP_NUMBERS, OTP_LENGTH)()

      await emailService.sendEmail(payload.email, otp, EMAIL_TEMPLATES.VERIFY_EMAIL)

      await redis.setex(
        `${REDIS_VERIFY_EMAIL_PREFIX}${otp}`,
        FIXED_TIME_VALUES.TWENTY_MINUTES,
        user.email
      )

      response.ok({
        message: 'Please verify your email',
      })
    } catch (error) {
      return response.badRequest(
        getErrorObject(error, {
          message: error.message,
        })
      )
    }
  }

  async login({ request, response }: HttpContext) {
    const payload = await request.validateUsing(loginUserValidator)
    const user = await User.verifyCredentials(payload.email, payload.password)

    try {
      const existingToken = await User.accessTokens.all(user)

      if (existingToken.length > 0) {
        await User.accessTokens.delete(user, existingToken[0].identifier)
      }

      const token = await User.accessTokens.create(user, ['*'], {
        expiresIn: '1 minute',
      })
      response.ok(token)
    } catch (error) {
      console.log(error)
    }
  }

  async verifyOtp({ request, response }: HttpContext) {
    const { otp } = request.body()
    const { type } = request.qs()

    try {
      let redisKey: string

      if (type === 'reset-password') {
        redisKey = REDIS_RESET_PASSWORD_PREFIX
      } else {
        redisKey = REDIS_VERIFY_EMAIL_PREFIX
      }

      const redisStoredEmail = await redis.get(`${redisKey}${otp}`)

      console.log('redisStoredEmail', redisStoredEmail)
      console.log('redisKey', redisKey)

      if (!redisStoredEmail) {
        return response.abort({
          success: false,
          message: 'Invalid or expired token',
        })
      }

      if (type !== 'reset-password') {
        const user = await User.findByOrFail('email', redisStoredEmail)

        if (user.emailVerified) {
          return response.badRequest({
            success: false,
            message: 'Email already verified',
          })
        }

        user.emailVerified = true
        await user.save()
      }

      response.ok({
        success: true,
        message: 'OTP verified successfully',
      })
    } catch (error) {
      console.log('error', error)
      return response.badRequest(
        getErrorObject(error, {
          message: 'Error fetching data from AuthController.verifyOtp ',
        })
      )
    }
  }

  async resendOtp({ request, response }: HttpContext) {
    try {
      const { email } = await request.validateUsing(emailValidator)
      const { type } = request.qs()

      let redisKey: string
      let emailTemplate: string

      await User.findByOrFail('email', email)

      console.log('type', type)

      const otp = customAlphabet(RANDOM_OTP_NUMBERS, OTP_LENGTH)()

      if (type === 'reset-password') {
        redisKey = REDIS_RESET_PASSWORD_PREFIX
        emailTemplate = EMAIL_TEMPLATES.RESET_PASSWORD
      } else {
        redisKey = REDIS_VERIFY_EMAIL_PREFIX
        emailTemplate = EMAIL_TEMPLATES.VERIFY_EMAIL
      }

      console.log('redisKey', redisKey)

      await emailService.sendEmail(email, otp, emailTemplate)

      await redis.setex(`${redisKey}${otp}`, FIXED_TIME_VALUES.TWENTY_MINUTES, email)

      response.ok({
        success: true,
        message: 'OTP sent successfully',
      })
    } catch (error) {
      console.log('error', error)
    }
  }

  // async verifyEmail({ request, response }: HttpContext) {
  //   try {
  //     const query = request.qs()

  //     const user = await User.findOrFail(query.uid)

  //     const token = await User.accessTokens.find(user, query.tid)
  //     if (!token) {
  //       response.abort({
  //         message: 'Token not found',
  //       })
  //     }

  //     if (token!.isExpired()) {
  //       response.abort({
  //         message: 'Token expired',
  //       })
  //     }

  //     user.emailVerified = true
  //     await user.save()

  //     await User.accessTokens.delete(user, token!.identifier)

  //     return response.send({
  //       message: 'Email verified successfully',
  //     })
  //   } catch (error) {
  //     console.log('error stuff', error)
  //   }
  // }

  async forgotPassword({ request, response }: HttpContext) {
    try {
      const { email } = await request.validateUsing(emailValidator)

      await User.findByOrFail('email', email)

      const otp = customAlphabet(RANDOM_OTP_NUMBERS, OTP_LENGTH)()

      await emailService.sendEmail(email, otp, EMAIL_TEMPLATES.RESET_PASSWORD)

      await redis.setex(
        `${REDIS_RESET_PASSWORD_PREFIX}${otp}`,
        FIXED_TIME_VALUES.TWENTY_MINUTES,
        email
      )

      response.ok({
        success: true,
        message: 'OTP sent successfully',
      })
    } catch (error) {
      return response.badRequest(getErrorObject(error))
    }
  }

  async resetPassword({ request, response }: HttpContext) {
    try {
      const { otp, email, password } = await request.validateUsing(resetPasswordValidator)
      const { type } = request.qs()

      let redisKey: string

      if (type === 'reset-password') {
        redisKey = REDIS_RESET_PASSWORD_PREFIX
      } else {
        redisKey = REDIS_VERIFY_EMAIL_PREFIX
      }

      const redisStoredEmail = await redis.get(`${redisKey}${otp}`)

      if (!redisStoredEmail) {
        return response.abort({
          success: false,
          message: 'Invalid or expired token',
        })
      }

      if (redisStoredEmail !== email) {
        return response.badRequest({
          success: false,
          message: 'Invalid email',
        })
      }

      const user = await User.findByOrFail('email', email)

      user.password = password
      await user.save()

      response.ok({
        success: true,
        message: 'Password reset successfully',
      })
    } catch (error) {
      return response.badRequest(getErrorObject(error))
    }
  }
}
