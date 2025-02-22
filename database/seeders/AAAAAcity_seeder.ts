import City from '#models/city'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import fs from 'fs/promises'
import path from 'path'

export default class extends BaseSeeder {
  public async run() {
    const statesString = await fs.readFile(path.join('database/seeders', 'states.json'), 'utf-8')
    const states = JSON.parse(statesString)
    let num = 0

    for (const state of states) {
      for (const city of state.cities) {
        console.log('city', num++, city.name)
        await City.updateOrCreate(
          { name: city.name },
          {
            id: city.id,
            name: city.name,
            countryId: state.country_id,
            countryCode: state.country_code,
            stateCode: state.state_code || null,
            stateId: state.id,
            latitude: city.latitude || null,
            longitude: city.longitude || null,
          }
        )
      }
    }
  }
}
