import PropertyFile from '#models/property_file'

interface UserRegisteredPayload {
  userId: string
  email: string
}

declare module '@adonisjs/core/types' {
  interface EventsList {
    'upload:create': PropertyFile
    'user:registered': UserRegisteredPayload
  }
}
