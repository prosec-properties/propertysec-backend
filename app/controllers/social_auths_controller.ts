import { getGoogleUserProfile } from '#helpers/auth'
import { errorResponse } from '#helpers/error'
import User from '#models/user'
import AuthToken from '#services/token'
import type { HttpContext } from '@adonisjs/core/http'
import { v4 as uuidv4 } from 'uuid'
import jwt from 'jsonwebtoken'

export default class SocialAuthController {
  async googleCallback({ response, request }: HttpContext) {
    try {
      const { accessToken, credential } = request.all()

      let profile: any = {}

      if (credential) {
        console.log('Decoding credential JWT')
        const data = jwt.decode(credential)
        console.log('Decoded credential data:', data)
        profile = data
      }

      if (accessToken) {
        console.log('Fetching profile with access token')
        const data = await getGoogleUserProfile(accessToken)
        console.log('Profile data from API:', data)
        profile = data
      }

      console.log('Final profile:', profile)

      const userDetails = {
        email: profile.email,
        fullName: profile.name,
        token: profile.token,
        avatar: profile.picture,
      }

      console.log('User details:', userDetails)

      if (!userDetails.email) {
        console.log('No email in profile, returning error')
        return response.badRequest({
          success: false,
          message: 'Email is required',
        })
      }

      const { user, isNew } = await this.generateUserDetails({
        name: userDetails.fullName,
        email: userDetails.email,
        avatar: userDetails.avatar,
        role: 'buyer',
      })

      console.log('User creation result:', { user: !!user, isNew })

      if (!user) {
        console.log('User creation failed')
        return response.badRequest({
          success: false,
          message: 'Could not create user',
        })
      }

      let token

      if (!isNew && user.hasCompletedRegistration) {
        console.log('Generating auth token for existing user')
        token = await AuthToken.generateAuthToken(user)
        console.log('Token generated:', !!token)
      }

      if (!isNew && user.hasCompletedRegistration && !token) {
        console.log('Token generation failed')
        return response.badRequest(errorResponse)
      }

      const responseData = {
        success: true,
        message: 'User authenticated successfully',
        data: {
          isNew,
          user,
          token: token || null,
        },
      }

      return response.ok(responseData)
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
      hasCompletedProfile: false,
      hasCompletedRegistration: false,
      avatarUrl: avatar,
      authProvider: 'google',
    }

    const userInDataBase = await User.query().orWhere('email', user.email).first()

    console.log('uwerInDB', { userInDataBase: !!userInDataBase, email: user.email })

    if (!userInDataBase) {
      console.log('Creating new user')
      const newUser = await User.create(user)
      console.log('New user created:', !!newUser)
      return {
        user: newUser,
        isNew: true,
      }
    }

    console.log('Existing user found, updating fields')
    if (!userInDataBase.emailVerified) {
      userInDataBase.emailVerified = true
    }

    if (!userInDataBase.avatarUrl && user.avatarUrl) {
      userInDataBase.avatarUrl = user.avatarUrl
    }

    await userInDataBase.save()
    console.log('Existing user updated')

    return {
      user: userInDataBase,
      isNew: false,
    }
  }
}
