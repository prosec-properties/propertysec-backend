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
import ProductsController from '#controllers/products_controller'
import AffiliatesController from '#controllers/affiliates_controller'
import CitiesController from '#controllers/cities_controller'
import SubscriptionsController from '#controllers/subscriptions_controller'
import AdminController from '#controllers/admin_controller'
import InvoicesController from '#controllers/invoices_controller'
import SettingsController from '#controllers/settings_controller'
import InspectionDetailsController from '#controllers/inspection_details_controller'

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
        router.post('/login', [AuthController, 'login']).use(middleware.rateLimit(['5', '900']))
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
        router.get('/users', [AdminController, 'fetchAllUsers'])
        router.get('/property-purchases', [AdminController, 'fetchPropertyPurchases'])
        router.patch('/property-purchases/:purchaseId/status', [AdminController, 'updatePropertyPurchaseStatus'])
      })
      .prefix('admin')

    router
      .group(() => {
        router.get('/me', [UsersController, 'me'])
        router.patch('/update-profile', [UsersController, 'updateProfile'])
        router.delete('/delete-file/:id', [UsersController, 'deleteFile'])
        router.get('/:id', [UsersController, 'showAUser'])
        router.post('/buyer/approve/:userId', [AdminController, 'approveBuyerUser'])
        router.post('/buyer/reject/:userId', [AdminController, 'rejectBuyerUser'])
        router.delete('/:userId', [AdminController, 'deleteUser'])
      })
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
        router.get('/cities/:id', [CitiesController, 'getCitiesByCountry'])
      })
      .prefix('states')

    router
      .group(() => {
        router.get('/me', [PropertiesController, 'myProperties'])
        router.get('/:id', [PropertiesController, 'show'])
        router.get('/', [PropertiesController, 'index'])
        router.delete('/:id', [PropertiesController, 'destroy'])
        router.post('/', [PropertiesController, 'store'])
        router.patch('/status/admin/:id', [PropertiesController, 'updatePropertyStatus'])
        router.patch('/:id', [PropertiesController, 'update'])
      })
      .prefix('properties')

    router
      .group(() => {
        router.get('/:id', [ProductsController, 'show'])
        router.get('/', [ProductsController, 'index'])
        router.post('/', [ProductsController, 'store'])
        router.patch('/:id', [ProductsController, 'update'])
        router.delete('/:id', [ProductsController, 'destroy'])
      })
      .prefix('products')

    router
      .group(() => {
        router.get('/myshop', [AffiliatesController, 'myShop'])
        router.get('/property/:propertyId', [AffiliatesController, 'isPropertyInShop'])
        router.get('/stats', [AffiliatesController, 'commisionSummary'])
        router.post('/add-to-shop', [AffiliatesController, 'saveToShop'])
        router.post('/remove-from-shop', [AffiliatesController, 'removeFromShop'])
      })
      .prefix('affiliates')

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
        router.get('/:invoiceId', [InvoicesController, 'getInvoice'])
      })
      .use(middleware.auth())
      .prefix('invoices')

    router
      .group(() =>
        router.get('/subscribed-users', [SubscriptionsController, 'fetchSubscribedUsers'])
      )
      .prefix('subscriptions')

    router
      .group(() => {
        router.get('/', [PlansContoller, 'index'])
      })
      .use(middleware.auth())
      .prefix('plans')

    router
      .group(() => {
        router.post('/', [TransactionsController, 'store'])
        router.get('/', [TransactionsController, 'index'])
        router.get('/:reference', [TransactionsController, 'show'])
      })

      .use(middleware.auth())
      .prefix('transactions')

    router
      .group(() => {
        router.post('/request', [LoansController, 'processLoanStep'])
        router.get('/me', [LoansController, 'getUserLoans'])
        router.get('/loan-requests', [LoansController, 'fetchedLoanRequests'])
        router.get('/loan-stats', [LoansController, 'loanStats'])
        router.get('/:id', [LoansController, 'getLoanById'])
        router.patch('/:id/approve', [LoansController, 'approveLoan'])
        router.patch('/:id/reject', [LoansController, 'rejectLoan'])
        router.patch('/:id/disburse', [LoansController, 'disburseLoan'])
      })
      .use(middleware.auth())
      .prefix('loans')

    router
      .group(() => {
        router.get('/', [SettingsController, 'show'])
        router.patch('/', [SettingsController, 'update'])
      })
      .prefix('settings')
      
    router
      .group(() => {
        router.get('/', [InspectionDetailsController, 'index'])
        router.get('/:id', [InspectionDetailsController, 'show'])
        router.post('/', [InspectionDetailsController, 'store'])
        router.patch('/:id/approval', [InspectionDetailsController, 'updateApprovalStatus'])
        router.patch('/:id/status', [InspectionDetailsController, 'updateInspectionStatus'])
      })
      .use(middleware.auth())
      .prefix('inspections')
  })
  .prefix('api/v1')
// .use(middleware.rateLimit(['100', '900']))
