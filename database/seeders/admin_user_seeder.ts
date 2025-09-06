import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'

export default class AdminUserSeeder extends BaseSeeder {
  public async run() {
    const email = 'livebuystore@gmail.com'
    const password = 'Prosec12345$'

    const existing = await User.findBy('email', email)
    if (existing) {
      // Ensure it is admin and has a valid password
      let needsSave = false
      if (existing.role !== 'admin') {
        existing.role = 'admin'
        needsSave = true
      }
      // If password looks unhashed or missing, reset it
      try {
        const ok = await hash.verify(existing.password, password)
        if (!ok) {
          existing.password = await hash.make(password)
          needsSave = true
        }
      } catch {
        // Stored password not hashed; re-hash
        existing.password = await hash.make(password)
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

    await User.create({
      fullName: 'PropertySec Admin',
      email,
      password: await hash.make(password),
      role: 'admin',
      emailVerified: true,
      hasCompletedProfile: false,
      hasCompletedRegistration: true,
      authProvider: 'email',
    })
  }
}
