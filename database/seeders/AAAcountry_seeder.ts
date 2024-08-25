import Country from '#models/country'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method
    const countries = [
      {
        name: 'Nigeria',
      },
    ]

    for (const country of countries) {
      await Country.updateOrCreate(
        { name: country.name },
        {
          name: country.name,
        }
      )
    }
  }
}
