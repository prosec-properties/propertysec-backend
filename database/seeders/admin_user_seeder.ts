import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'

export default class AdminUserSeeder extends BaseSeeder {
  public async run() {
    const email = 'propertyseconline@gmail.com'
    const password = 'Prosec12345$'

    console.log('Checking for existing admin user with email:', email)

    const existing = await User.findBy('email', email)
    if (existing) {
      // Ensure it is admin and has a valid password
      let needsSave = false
      if (existing.role !== 'admin') {
        existing.role = 'admin'
        needsSave = true
      }
      if (!existing.emailVerified) {
        existing.emailVerified = true
        needsSave = true
      }
      if (!existing.hasCompletedRegistration) {
        existing.hasCompletedRegistration = true
        needsSave = true
      }
      if (needsSave) await existing.save()
      return
    }

    console.log('Creating admin user with email:', email)

    await User.updateOrCreate(
      { email },
      {
        fullName: 'PropertySec Admin',
        password,
        role: 'admin',
        emailVerified: true,
        hasCompletedProfile: false,
        hasCompletedRegistration: true,
        authProvider: 'email',
      }
    )

    // await User.create({
    //   fullName: 'PropertySec Admin',
    //   email,
    //   password,
    //   role: 'admin',
    //   emailVerified: true,
    //   hasCompletedProfile: false,
    //   hasCompletedRegistration: true,
    //   authProvider: 'email',
    // })
  }
}
