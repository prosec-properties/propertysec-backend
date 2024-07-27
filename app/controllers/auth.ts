import User from '#models/user'
import emailService from '#services/email'
import { loginUserValidator, registerUserValidator } from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'
import { customAlphabet } from 'nanoid'
import redis from '@adonisjs/redis/services/main'
import { REDIS_VERIFY_EMAIL_PREFIX } from '#constants/auth'
import { FIXED_TIME_VALUES } from '#constants/time'

export default class AuthController {
  async register({ request, response }: HttpContext) {
    const payload = await request.validateUsing(registerUserValidator)
    try {
      const user = await User.create(payload)

      const token = await User.accessTokens.create(user, ['*'], {
        expiresIn: '15 minutes',
      })

      if (!token) {
        response.abort({
          message: 'Error creating token',
        })
      }

      const otp = customAlphabet('1234567890', 6)()

      await emailService.sendEmail(payload.email, otp)

      await redis.setex(
        `${REDIS_VERIFY_EMAIL_PREFIX}${otp}`,
        FIXED_TIME_VALUES.FIFTEEN_MINUTES,
        user.email
      )

      response.ok({
        message: 'Please verify your email',
      })
    } catch (error) {
      console.log('error', error)
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

    const redisStoredEmail = await redis.get(`${REDIS_VERIFY_EMAIL_PREFIX}${otp}`)

    if (!redisStoredEmail) {
      return response.abort({
        success: false,
        message: 'Invalid or expired token',
      })
    }

    const user = await User.findByOrFail('email', redisStoredEmail)

    if (user.emailVerified) {
      return response.abort({
        success: false,
        message: 'Email already verified',
      })
    }

    user.emailVerified = true
    await user.save()

    response.ok({
      success: true,
      message: 'OTP verified successfully',
    })
  }

  async resendOtp({ request, response }: HttpContext) {
    const { email } = request.body()

    try {
      await User.findByOrFail('email', email)

      const otp = customAlphabet('1234567890', 6)()

      await emailService.sendEmail(email, otp)

      await redis.setex(
        `${REDIS_VERIFY_EMAIL_PREFIX}${otp}`,
        FIXED_TIME_VALUES.FIFTEEN_MINUTES,
        email
      )

      response.ok({
        success: true,
        message: 'OTP sent successfully',
      })
    } catch (error) {
      console.log('error', error)
    }
  }

  async verifyEmail({ request, response }: HttpContext) {
    try {
      const query = request.qs()

      const user = await User.findOrFail(query.uid)

      const token = await User.accessTokens.find(user, query.tid)
      if (!token) {
        response.abort({
          message: 'Token not found',
        })
      }

      if (token!.isExpired()) {
        response.abort({
          message: 'Token expired',
        })
      }

      user.emailVerified = true
      await user.save()

      await User.accessTokens.delete(user, token!.identifier)

      return response.send({
        message: 'Email verified successfully',
      })
    } catch (error) {
      console.log('error stuff', error)
    }
  }
}
