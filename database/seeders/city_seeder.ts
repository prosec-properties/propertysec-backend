// import City from '#models/city'
// import { BaseSeeder } from '@adonisjs/lucid/seeders'
// import fs from 'fs/promises'
// import path from 'path'

// export default class extends BaseSeeder {
//   public async run() {
//     const statesString = await fs.readFile(path.join('database/seeders', 'states.json'), 'utf-8')
//     const states = JSON.parse(statesString)
//     let num = 0


//     for (const state of states) {
//       for (const city of state.cities) {
//         console.log('city', num++, city.name)
//         try {
//           await City.updateOrCreate(
//             { id: city.id },  
//             {
//               name: city.name,
//               countryId: state.country_id,
//               stateId: state.id,
//               stateCode: state.state_code || null,
//               latitude: city.latitude || null,
//               longitude: city.longitude || null,
//             }
//           )
//         } catch (error) {
//           console.error(`Error inserting city ${city.name}:`, error)
//           // Continue with next city even if one fails
//           continue
//         }
//       }
//     }
//   }
// }
