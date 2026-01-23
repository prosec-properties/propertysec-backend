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
  async handle(error: any, ctx: HttpContext) {
    // Standardize authentication errors
    if (error instanceof errors.E_INVALID_CREDENTIALS) {
      return ctx.response.status(error.status).send({
        success: false,
        message: 'Invalid credentials. Please check your email and password.',
        requestFail: true,
      })
    }

    if (error.code === 'E_UNAUTHORIZED_ACCESS') {
      return ctx.response.status(401).send({
        success: false,
        message: 'Unauthorized access. Please login.',
        requestFail: true,
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

      return ctx.response.status(409).send({
        success: false,
        message,
        requestFail: true,
      })
    }

    // Handle 404 Not Found
    if (error.status === 404) {
      return ctx.response.status(404).send({
        success: false,
        message: 'The requested resource was not found.',
        requestFail: true,
      })
    }

    // Production-ready generic error handling
    if (app.inProduction && !ctx.response.finished) {
      const status = error.status || 500
      const message = status === 500 ? 'An internal server error occurred.' : error.message

      return ctx.response.status(status).send({
        success: false,
        message,
        requestFail: true,
        ...(status === 500 ? {} : { code: error.code }),
      })
    }

    return super.handle(error, ctx)
  }

  /**
   * The method is used to report error to the logging service or
   * the third party error monitoring service.
   */
  async report(error: unknown, ctx: HttpContext) {
    if (this.shouldReport(error as any)) {
      ctx.logger.error({ err: error, requestId: ctx.request.id() }, 'HTTP Request Error')
    }
    return super.report(error, ctx)
  }
}
