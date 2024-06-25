import User from '#models/user'
import email from '#services/email'
import { loginUserValidator, registerUserValidator } from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'

export default class AuthController {
  async register({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(registerUserValidator)

      const user = await User.create(payload)

      const token = await User.accessTokens.create(user, ['*'], {
        expiresIn: '15 minutes',
      })

      if (!token) {
        response.abort({
          message: 'Error creating token',
        })
      }

      await email.sendEmail(payload.email, user.id, token.identifier as string)

      response.ok({
        message: 'Please verify your email',
      })
    } catch (error) {
      console.log('error', error)
    }
  }

  async login({ request, response }: HttpContext) {
    try {
      console.log('payload', request.body())
      const payload = await request.validateUsing(loginUserValidator)
      const user = await User.verifyCredentials(payload.email, payload.password)

      const existingToken = await User.accessTokens.all(user)

      if (existingToken.length > 0) {
        await User.accessTokens.delete(user, existingToken[0].identifier)
      }

      const token = await User.accessTokens.create(user, ['*'], {
        expiresIn: '30 days',
      })
      console.log('token', token)
      response.ok(token)
    } catch (error) {
      console.log(error)
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
