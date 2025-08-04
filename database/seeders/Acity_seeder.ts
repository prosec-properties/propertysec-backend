import City from '#models/city'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import fs from 'fs/promises'
import path from 'path'

export default class extends BaseSeeder {
  public async run() {
    const naijaCitiesString = await fs.readFile(
      path.join('database/seeders', 'nigerianCities.json'),
      'utf-8'
    )
    let num = 0
    const cities = JSON.parse(naijaCitiesString)

    for (const city of cities?.data) {
      console.log('city', num++, city.name)
      try {
        await City.updateOrCreate(
          { id: city.id },
          {
            name: city.name,
            countryId: city.countryId,
            stateId: city.stateId,
            stateCode: city.stateCode || null,
            latitude: city.latitude || null,
            longitude: city.longitude || null,
          }
        )
      } catch (error) {
        console.error(`Error inserting city ${city.name}:`, error)
        // Continue with next city even if one fails
        continue
      }
    }
  }
}
