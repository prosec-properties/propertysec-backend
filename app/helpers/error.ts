import logger from '@adonisjs/core/services/logger'

export const getErrorObject = (
  error: any,
  options?: {
    controller: string
    message?: string
    consoleLog?: boolean
    [key: string]: any
  }
) => {
  const { message, consoleLog = false, ...others } = options || {}

  logger.error(error, (message || 'ERROR: Something went wrong') + ` from ${options?.controller}`)

  if (consoleLog) {
    console.log(error)
  }

  let userMessage = message || 'Something went wrong. Please try again.'
  
  if (error.messages?.errors) {
    const validationErrors = error.messages.errors
    if (Array.isArray(validationErrors) && validationErrors.length > 0) {
      userMessage = validationErrors[0].message || userMessage
    }
  }
  
  if (error.code === '23505') {
    const constraint = error.constraint || ''
    const detail = error.detail || ''
    
    if (constraint.includes('phone_number') || detail.includes('phone_number')) {
      userMessage = 'This phone number is already registered. Please use a different one.'
    } else if (constraint.includes('email') || detail.includes('email')) {
      userMessage = 'This email address is already registered. Please use a different one.'
    } else {
      userMessage = 'This information is already in use. Please provide different details.'
    }
  }
  
  if (error.message && typeof error.message === 'string' && error.message !== 'ERROR: Something went wrong') {
    if (!error.message.includes('SQLSTATE') && !error.message.includes('duplicate key')) {
      userMessage = error.message
    }
  }

  return {
    message: userMessage,
    success: false,
    ...(process.env.NODE_ENV === 'development' && {
      error: error.messages?.errors ?? error.body?.errors,
      errorInfo: error.message,
      errorData: error,
    }),
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
