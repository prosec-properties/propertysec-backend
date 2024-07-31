import User from '#models/user'
import emailService from '#services/email'
import {
  emailValidator,
  loginUserValidator,
  registerUserValidator,
  resetPasswordValidator,
} from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'
import redis from '@adonisjs/redis/services/main'
import { REDIS_RESET_PASSWORD_PREFIX, REDIS_VERIFY_EMAIL_PREFIX } from '#constants/auth'
import { errorResponse, getErrorObject } from '#helpers/error'
import env from '#start/env'
import AuthToken from '#services/token'
import { setSearchParams } from '#helpers/general'
import UserService from '#services/user'

export default class AuthController {
  async register({ request, response }: HttpContext) {
    const payload = await request.validateUsing(registerUserValidator)
    try {
      const userExists = await User.findBy('email', payload.email)

      if (userExists) {
        console.log('userExists', userExists)
        return response.badRequest(errorResponse('User already exists'))
      }

      const user = await User.create(payload)

      await UserService.verifyEmail(user)

      response.ok({
        success: true,
        message: 'Please verify your email',
      })
    } catch (error) {
      return response.badRequest(getErrorObject(error))
    }
  }

  async login({ request, response }: HttpContext) {
    const payload = await request.validateUsing(loginUserValidator)
    const user = await User.verifyCredentials(payload.email, payload.password)

    try {
      const isEmailVerified = user.emailVerified
      if (!isEmailVerified) {
        return response.badRequest(errorResponse('Please verify your email'))
      }

      const token = await AuthToken.generateAuthToken(user)

      response.ok({
        success: true,
        data: {
          user,
          token,
        },
      })
    } catch (error) {
      console.log(error)
      getErrorObject(error)
    }
  }

  async verifyOtp({ request, response }: HttpContext) {
    const { otp, email } = request.body()

    try {
      const user = await User.findByOrFail('email', email)

      const storedOtp = await redis.get(`${REDIS_VERIFY_EMAIL_PREFIX}${user.id}`)

      if (!storedOtp) {
        return response.badRequest({
          success: false,
          message: 'Expired OTP',
        })
      }

      const isOtpValid = storedOtp === otp

      if (!isOtpValid) {
        return response.badRequest(errorResponse('Invalid OTP'))
      }

      await UserService.emailIsVerified(user)

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

      const user = await User.findByOrFail('email', email)

      await UserService.verifyEmail(user)

      response.ok({
        success: true,
        message: 'OTP sent successfully',
      })
    } catch (error) {
      return response.badRequest(getErrorObject(error))
    }
  }

  async forgotPassword({ request, response }: HttpContext) {
    try {
      const { email } = await request.validateUsing(emailValidator)

      const user = await User.findByOrFail('email', email)

      const token = await AuthToken.generatePasswordResetToken(user)

      if (!token) {
        return response.badRequest(errorResponse('Error occured generating token'))
      }

      const params = {
        token,
        email,
      }

      const searchParams = setSearchParams(params)

      const resetLink = `${env.get('FRONT_END_URL')}/auth/reset-password?${searchParams}`

      await emailService.sendResetPasswordMail(email, resetLink)

      response.ok({
        success: true,
        message: 'Reset password link sent to your email!',
      })
    } catch (error) {
      return response.badRequest(getErrorObject(error))
    }
  }

  async resetPassword({ request, response }: HttpContext) {
    try {
      const { token, email, password } = await request.validateUsing(resetPasswordValidator)

      const user = await User.findByOrFail('email', email)

      const storedToken = await redis.get(`${REDIS_RESET_PASSWORD_PREFIX}${user.id}`)

      const isTokenValid = storedToken === token

      if (!isTokenValid || !storedToken) {
        return response.badRequest(errorResponse('Invalid or expired token'))
      }

      user.password = password
      await user.save()

      response.ok({
        success: true,
        message: 'Your password has been reset successfully!',
      })

      await redis.del(`${REDIS_RESET_PASSWORD_PREFIX}${user.id}`)
    } catch (error) {
      return response.badRequest(getErrorObject(error))
    }
  }
}
