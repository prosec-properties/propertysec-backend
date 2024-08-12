import type { HttpContext } from '@adonisjs/core/http'

export default class LoggerMiddleware {
  async handle(ctx: HttpContext, next: () => Promise<void>) {
    const { request, logger } = ctx
    let log = {} as any

    logger.info(
      {
        method: request.method(),
        url: request.url(true),
        logTime: new Date().toISOString(),
        // ips: request.ips(),
        // traceId: request.id(),
        // ...log,
      },
      'Incoming Request'
    )
    await next()
    logger.info('Request Closed')
  }
}
