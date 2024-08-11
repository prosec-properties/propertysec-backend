import User from '#models/user'
import emailService from '#services/email'
import {
  completeRegistrationValidator,
  emailValidator,
  loginUserValidator,
  registerUserValidator,
  resetPasswordValidator,
} from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'
import redis from '@adonisjs/redis/services/main'
import { REDIS_RESET_PASSWORD_PREFIX } from '#constants/auth'
import { errorResponse, getErrorObject } from '#helpers/error'
import env from '#start/env'
import AuthToken from '#services/token'
import { setSearchParams } from '#helpers/general'
import UserService from '#services/user'
import Otp from '#models/otp'
import { DateTime } from 'luxon'

export default class AuthController {
  async register({ request, response }: HttpContext) {
    const payload = await request.validateUsing(registerUserValidator)
    try {
      const userExists = await User.findBy('email', payload.email)

      if (userExists) {
        return response.badRequest(errorResponse('User already exists'))
      }

      const user = await User.create({
        ...payload,
        emailVerified: false,
        hasCompletedProfile: false,
        hasCompletedRegistration: true,
      })

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
        token,
      })
    } catch (error) {
      console.log(error)
      response.badRequest(getErrorObject(error))
    }
  }

  async verifyOtp({ request, response }: HttpContext) {
    const { email } = request.body()

    try {
      const user = await User.findByOrFail('email', email)

      const storedOtp = await Otp.findByOrFail('userId', user.id)

      const isOtpValid = storedOtp.expiresAt > DateTime.now()

      if (!isOtpValid) {
        return response.badRequest(errorResponse('Invalid or expired OTP'))
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
          controller: 'AuthController.verifyOtp',
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
      const user = await User.findBy('email', email)

      if (!user) {
        return response.badRequest(errorResponse('User not found'))
      }

      const token = await AuthToken.generateToken(user)

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
      const { email, password } = await request.validateUsing(resetPasswordValidator)

      const user = await User.findByOrFail('email', email)

      const otp = await Otp.findByOrFail('userId', user.id)

      const isTokenValid = otp.expiresAt > DateTime.now()

      console.log({ isTokenValid })

      if (!isTokenValid) {
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

  async completeRegistration({ request, response }: HttpContext) {
    try {
      const { role, phoneNumber, email } = await request.validateUsing(
        completeRegistrationValidator
      )

      const user = await User.findByOrFail('email', email)

      user.role = role
      user.phoneNumber = phoneNumber
      user.hasCompletedRegistration = true
      await user.save()

      const token = await AuthToken.generateAuthToken(user)

      return response.ok({
        success: true,
        token,
      })
    } catch (error) {
      return response.badRequest(getErrorObject(error))
    }
  }

  async logout({ logger, response, auth }: HttpContext) {
    try {
      await auth.authenticate()

      const user = auth.user!

      await AuthToken.revokeAuthToken(user)

      logger.info('User logged out successfully, from AuthController.logout')

      response.ok({
        success: true,
        message: 'Logged out successfully',
      })
    } catch (error) {
      return response.badRequest(
        getErrorObject(error, {
          controller: 'AuthController.logout',
        })
      )
    }
  }
}
