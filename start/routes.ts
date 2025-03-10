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
import PaymentsController from '#controllers/payments_controller'
import PlansContoller from '#controllers/plans_controller'
import TransactionsController from '#controllers/transactions_controller'
import StatesController from '#controllers/states_controller'
import LoansController from '#controllers/loan_controller'

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
        router.delete('/delete-file/:id', [UsersController, 'deleteFile'])
      })
      .use(middleware.auth())
      .prefix('users')

    router
      .group(() => {
        router.get('/:id', [CountriesController, 'show'])
        router.get('/', [CountriesController, 'index'])
      })
      .prefix('countries')

    router
      .group(() => {
        // router.get('/:id', [StatesController, 'show'])
        router.get('/', [StatesController, 'index'])
      })
      .prefix('states')

    router
      .group(() => {
        router.get('/me', [PropertiesController, 'myProperties'])
        router.get('/:id', [PropertiesController, 'show'])
        router.get('/', [PropertiesController, 'index'])
        router.delete('/:id', [PropertiesController, 'destroy'])
        router.post('/', [PropertiesController, 'store'])
      })
      .prefix('properties')

    router
      .group(() => {
        router.get('/', [CategoriesController, 'index'])
      })
      .prefix('categories')

    router
      .group(() => {
        router.post('/init', [PaymentsController, 'initializeSubscriptionPayment'])
      })
      .use(middleware.auth())
      .prefix('payment')

    router
      .group(() => {
        router.get('/', [PlansContoller, 'index'])
      })
      .use(middleware.auth())
      .prefix('plans')

    router
      .group(() => {
        router.post('/', [TransactionsController, 'store'])
      })
      .use(middleware.auth())
      .prefix('transactions')

    router
      .group(() => {
        router.post('/request', [LoansController, 'initializeObtainLoan'])
      })
      .prefix('loans')
  })
  .prefix('api/v1')
