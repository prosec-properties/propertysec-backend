/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import AuthController from '#controllers/auth'
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
import UsersController from '#controllers/users_controller'
import SocialAuthController from '#controllers/social_auths_controller'
import CountriesController from '#controllers/countries_controller'
import PropertiesController from '#controllers/properties_controller'
import CategoriesController from '#controllers/categories_controller'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router.get('/test', async ({ view }) => {
  return view.render('emails/verify_email_text')
})

router
  .group(() => {
    router
      .group(() => {
        router.post('/login', [AuthController, 'login'])
        router.post('/register', [AuthController, 'register'])
        router.post('/verify-otp', [AuthController, 'verifyOtp'])
        router.post('/resend-otp', [AuthController, 'resendOtp'])
        router.post('/forgot-password', [AuthController, 'forgotPassword'])
        router.post('/reset-password', [AuthController, 'resetPassword'])
        router.get('/google/callback', [SocialAuthController, 'googleCallback'])
        router.post('/complete-registration', [AuthController, 'completeRegistration'])
        router.get('/logout', [AuthController, 'logout']).use(middleware.auth())
      })
      .prefix('auth')

    router
      .group(() => {
        router.get('/me', [UsersController, 'me'])
        router.put('/update-profile', [UsersController, 'updateProfile'])
      })
      .use(middleware.auth())
      .prefix('users')

    router
      .group(() => {
        router.get('/', [CountriesController, 'index'])
      })
      .prefix('countries')

    router
      .group(() => {
        router.get('/', [PropertiesController, 'index'])
        router.post('/', [PropertiesController, 'store'])
      })
      .prefix('properties')

    router
      .group(() => {
        router.get('/', [CategoriesController, 'index'])
      })
      .prefix('categories')
  })
  .prefix('api/v1')
