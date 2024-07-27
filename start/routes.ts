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
        router.get('/verify-email', [AuthController, 'verifyEmail'])
        router.post('/verify-otp', [AuthController, 'verifyOtp'])
        router.post('/resend-otp', [AuthController, 'resendOtp'])
      })
      .prefix('auth')

    router
      .group(() => {
        router.get('/me', [UsersController, 'me'])
      })
      .use(middleware.auth())
      .prefix('users')
  })
  .prefix('api/v1')
