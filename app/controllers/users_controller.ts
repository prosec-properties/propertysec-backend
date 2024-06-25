import type { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
  async me({ auth, response }: HttpContext) {
    try {
      await auth.check()
      const user = auth.user!

      response.ok(user)
    } catch (error) {
      console.log(error.message)
    }
  }
}
