import type { HttpContext } from '@adonisjs/core/http'

export default class LoggerMiddleware {
  async handle(ctx: HttpContext, next: () => Promise<void>) {
    const { request, logger } = ctx

    logger.info(
      {
        method: request.method(),
        url: request.url(true),
        logTime: new Date().toISOString(),
      },
      'Incoming Request'
    )
    await next()
    logger.info('Request Closed')
  }
}
