import logger from '@adonisjs/core/services/logger'

export const getErrorObject = (
  error: any,
  options?: {
    controller: string
    message?: string
    // log: boolean
    consoleLog?: boolean
    [key: string]: any
  }
) => {
  const { message, consoleLog = false, ...others } = options || {}

  logger.error(error, (message || 'ERROR: Something went wrong') + `from ${options?.controller}`)

  

  if (consoleLog) {
    console.log(error)
  }

  return {
    message: message || 'ERROR: Something went wrong',
    success: false,
    error: error.messages?.errors ?? error.body?.errors,
    errorInfo: error.message,
    errorData: error,
    requestFail: true,
    ...others,
  }
}

export const errorResponse = (message: string) => {
  return {
    success: false,
    message: message || 'An error occurred',
  }
}
