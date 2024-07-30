import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class LoggerMiddleware {
  async handle({ request, logger }: HttpContext, next: NextFn) {
    /**
     * Middleware logic goes here (before the next call)
     */
    const query = request.qs()
    const queryKeys = Object.keys(query)
    let queryStr = ''
    queryKeys.forEach((key, i) => {
      queryStr += `${i > 0 ? '&' : '?'}${key}=${query[key]}`
    })
    const logMessage = `${request.method()}-${request.url()}${queryStr} | User Agent - ${
      request.headers()['user-agent']
    } | Request IP - ${request.ip()}`

    logger.info(
      {
        body: request.body(),
        files: request.files('files'),
      },
      logMessage
    )
    console.log(logger)

    /**
     * Call next method in the pipeline and return its output
     */
    const output = await next()
    return output
  }
}
