import State, { ICities } from '#models/state'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import fs from 'fs/promises'
import path from 'path'

export default class extends BaseSeeder {
  async run() {
    const statesString = await fs.readFile(path.join('database/seeders', 'states.json'), 'utf-8')
    const states = JSON.parse(statesString)

    for (const state of states) {
      await State.updateOrCreate(
        { name: state.name },
        {
          id: state.id,
          name: state.name,
          countryId: state.country_id,
          stateCode: state.state_code,
          latitude: state.latitude,
          longitude: state.longitude,
          cities: JSON.stringify(state.cities),
        }
      )
    }
  }
}
