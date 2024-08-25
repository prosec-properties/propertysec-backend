import PropertyFile from '#models/property_file'

declare module '@adonisjs/core/types' {
  interface EventsList {
    'upload:create': PropertyFile
  }
}
