import app from '@adonisjs/core/services/app'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import { errors } from '@adonisjs/auth'

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: unknown, ctx: HttpContext) {
    if (error instanceof errors.E_INVALID_CREDENTIALS) {
      return ctx.response
        .status(error.status)
        .send({ 
          success: false, 
          message: 'Invalid credentials. Please check your email and password.',
          requestFail: true
        })
    }

    if (error && typeof error === 'object' && 'code' in error && error.code === 'E_VALIDATION_ERROR') {
      const validationError = error as any
      const firstError = validationError.messages?.errors?.[0]
      
      return ctx.response
        .status(422)
        .send({
          success: false,
          message: firstError?.message || 'Validation failed. Please check your input.',
          errors: validationError.messages?.errors,
          requestFail: true
        })
    }

    if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
      const dbError = error as any
      const constraint = dbError.constraint || ''
      const detail = dbError.detail || ''
      
      let message = 'This information is already in use. Please provide different details.'
      
      if (constraint.includes('phone_number') || detail.includes('phone_number')) {
        message = 'This phone number is already registered. Please use a different one.'
      } else if (constraint.includes('email') || detail.includes('email')) {
        message = 'This email address is already registered. Please use a different one.'
      }
      
      return ctx.response
        .status(409)
        .send({
          success: false,
          message,
          requestFail: true
        })
    }

    return super.handle(error, ctx)
  }

  /**
   * The method is used to report error to the logging service or
   * the third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}
