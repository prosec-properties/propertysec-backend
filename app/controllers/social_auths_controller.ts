import { errorResponse } from '#helpers/error'
import User from '#models/user'
import AuthToken from '#services/token'
import type { HttpContext } from '@adonisjs/core/http'
import { v4 as uuidv4 } from 'uuid'

export default class SocialAuthController {
  async googleRedirect({ ally, response }: HttpContext) {
    try {
      const google = await ally.use('google').redirectUrl()

      return response.ok({
        success: true,
        data: google,
      })
    } catch (error) {
      return response.badRequest(errorResponse(error.message))
    }
  }

  async googleCallback({ ally, response }: HttpContext) {
    try {
      const google = ally.use('google')

      /**
       * User has denied access by canceling
       * the login flow
       */
      if (google.accessDenied()) {
        return 'You have cancelled the login process'
      }

      /**
       * OAuth state verification failed. This happens when the
       * CSRF cookie gets expired.
       */
      if (google.stateMisMatch()) {
        return 'We are unable to verify the request. Please try again'
      }

      /**
       * GitHub responded with some error
       */
      if (google.hasError()) {
        return google.getError()
      }

      /**
       * Access user info
       */
      const googleUser = await google.user()
      console.log('user', googleUser)

      const userDetails = {
        email: googleUser.email,
        name: googleUser.name,
        token: googleUser.token,
        avatar: googleUser.avatarUrl,
      }

      if (!userDetails.email) {
        return response.badRequest({
          success: false,
          message: 'Email is required',
        })
      }

      await this.generateUserDetails({
        name: userDetails.name,
        email: userDetails.email,
        avatar: userDetails.avatar,
        role: 'buyer',
      })

      const user = await User.findByOrFail('email', userDetails.email)

      const token = await AuthToken.generateAuthToken(user)

      return response.ok({
        success: true,
        data: {
          user,
          token,
        },
      })
    } catch (error) {
      console.log(error)
      return response.badRequest(errorResponse(error.message))
    }
  }

  async generateUserDetails({
    name,
    email,
    avatar,
    role,
  }: {
    name: string
    email: string
    avatar: string | null
    role: any
  }): Promise<{
    user: User
    isNew: boolean
  }> {
    const user = {
      fullname: name,
      email,
      password: uuidv4(),
      role: role || 'buyer',
      emailVerified: true,
      avatar,
      authProvider: 'google',
    }

    const userInDataBase = await User.query().orWhere('email', user.email).first()

    if (!userInDataBase) {
      const newUser = await User.create(user)
      return {
        user: newUser,
        isNew: true,
      }
    }

    if (!userInDataBase.emailVerified) {
      userInDataBase.emailVerified = true
    }

    if (!userInDataBase.avatarUrl && user.avatar) {
      userInDataBase.avatarUrl = user.avatar
    }

    await userInDataBase.save()

    return {
      user: userInDataBase,
      isNew: false,
    }
  }
}
