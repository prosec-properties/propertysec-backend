import { getGoogleUserProfile } from '#helpers/auth'
import { errorResponse } from '#helpers/error'
import User from '#models/user'
import AuthToken from '#services/token'
import type { HttpContext } from '@adonisjs/core/http'
import { v4 as uuidv4 } from 'uuid'

export default class SocialAuthController {
  async googleCallback({ response, request }: HttpContext) {
    try {
      const { accessToken, credential } = request.all()

      let profile: any = {}

      if (credential) {
        // @ts-ignore
        const data = jwt.decode(credential, Env.get('GOOGLE_CLIENT_SECRET'))
        profile = data
      }

      if (accessToken) {
        const data = await getGoogleUserProfile(accessToken)
        profile = data
      }

      const userDetails = {
        email: profile.email,
        fullName: profile.name,
        token: profile.token,
        avatar: profile.picture,
      }

      if (!userDetails.email) {
        return response.badRequest({
          success: false,
          message: 'Email is required',
        })
      }

      const { user } = await this.generateUserDetails({
        name: userDetails.fullName,
        email: userDetails.email,
        avatar: userDetails.avatar,
        role: 'buyer',
      })

      if (!user) {
        return response.badRequest({
          success: false,
          message: 'Could not create user',
        })
      }

      const token = await AuthToken.generateAuthToken(user)

      return response.ok({
        success: true,
        token,
      })
    } catch (error) {
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
    avatar: string
    role: any
  }): Promise<{
    user: User
    isNew: boolean
  }> {
    const user = {
      fullName: name,
      email,
      password: uuidv4(),
      role: role || 'buyer',
      emailVerified: true,
      avatarUrl: avatar,
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

    if (!userInDataBase.avatarUrl && user.avatarUrl) {
      userInDataBase.avatarUrl = user.avatarUrl
    }

    await userInDataBase.save()

    return {
      user: userInDataBase,
      isNew: false,
    }
  }
}

//   profile {
//     id: '107688208964398692218',
//     email: 'javanslem@gmail.com',
//     verified_email: true,
//     name: 'Nnakwe Anslem',
//     given_name: 'Nnakwe',
//     family_name: 'Anslem',
//     picture: 'https://lh3.googleusercontent.com/a/ACg8ocKAIC7rL82GHnx_RWOe71mkubVgEnV46W0V7Tlj8Ufp60nSHA=s96-c'
//   }
//   userDetails {
//     email: 'javanslem@gmail.com',
//     name: 'Nnakwe Anslem',
//     token: undefined,
//     avatar: undefined
//   }
