import User from '#models/user'
import { loginUserValidator, registerUserValidator } from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'

export default class AuthController {
  async register({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(registerUserValidator)

      console.log(payload)

      const user = await User.create(payload)

      const token = await User.accessTokens.create(user, ['*'], {
        expiresIn: '30 days',
      })

      response.created({
        message: 'Login successful',
        token,
      })
    } catch (error) {
      console.log(error.message)
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

  async me({ auth, response }: HttpContext) {
    try {
      await auth.check()
      const user = auth.user!

      response.ok(user)
    } catch (error) {
      console.log(error.message)
    }
  }
}
