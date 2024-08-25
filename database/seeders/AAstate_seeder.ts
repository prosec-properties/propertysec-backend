import State from '#models/state'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

const nigeriaId = '8735945e-f649-47f6-b4a9-6875986ebd3b'

export default class extends BaseSeeder {
  public async run() {
    const nigerianStates = [
      { countryId: nigeriaId, name: 'Abia' },
      { countryId: nigeriaId, name: 'Abuja' },
      { countryId: nigeriaId, name: 'Adamawa' },
      { countryId: nigeriaId, name: 'Akwa Ibom' },
      { countryId: nigeriaId, name: 'Anambra' },
      { countryId: nigeriaId, name: 'Bauchi' },
      { countryId: nigeriaId, name: 'Bayelsa' },
      { countryId: nigeriaId, name: 'Benue' },
      { countryId: nigeriaId, name: 'Borno' },
      { countryId: nigeriaId, name: 'Cross River' },
      { countryId: nigeriaId, name: 'Delta' },
      { countryId: nigeriaId, name: 'Ebonyi' },
      { countryId: nigeriaId, name: 'Edo' },
      { countryId: nigeriaId, name: 'Ekiti' },
      { countryId: nigeriaId, name: 'Enugu' },
      { countryId: nigeriaId, name: 'Gombe' },
      { countryId: nigeriaId, name: 'Imo' },
      { countryId: nigeriaId, name: 'Jigawa' },
      { countryId: nigeriaId, name: 'Kaduna' },
      { countryId: nigeriaId, name: 'Kano' },
      { countryId: nigeriaId, name: 'Katsina' },
      { countryId: nigeriaId, name: 'Kebbi' },
      { countryId: nigeriaId, name: 'Kogi' },
      { countryId: nigeriaId, name: 'Kwara' },
      { countryId: nigeriaId, name: 'Lagos' },
      { countryId: nigeriaId, name: 'Nasarawa' },
      { countryId: nigeriaId, name: 'Niger' },
      { countryId: nigeriaId, name: 'Ogun' },
      { countryId: nigeriaId, name: 'Ondo' },
      { countryId: nigeriaId, name: 'Osun' },
      { countryId: nigeriaId, name: 'Oyo' },
      { countryId: nigeriaId, name: 'Plateau' },
      { countryId: nigeriaId, name: 'Rivers' },
      { countryId: nigeriaId, name: 'Sokoto' },
      { countryId: nigeriaId, name: 'Taraba' },
      { countryId: nigeriaId, name: 'Yobe' },
      { countryId: nigeriaId, name: 'Zamfara' },
    ]

    for (const state of nigerianStates) {
      await State.updateOrCreate(
        { name: state.name },
        {
          name: state.name,
          countryId: nigeriaId,
        }
      )
    }
  }
}
