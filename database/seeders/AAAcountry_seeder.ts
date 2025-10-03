// import Country from '#models/country'
// import { BaseSeeder } from '@adonisjs/lucid/seeders'
// import { countriesData } from './countriesData.js'

// export default class extends BaseSeeder {
//   async run() {
   
//     let num = 0

//     for (const country of countriesData) {
//         console.log('country', num++, country.name)
//       await Country.updateOrCreate(
//         { name: country.name },
//         {
//           id: country.id,
//           name: country.name,
//           phoneCode: country.phoneCode,
//           capital: country.capital,
//           iso: country.iso,
//           emoji: country.emoji,
//           region: country.region,
//           subregion: country.subregion,
//           currency: country.currency,
//           currencySymbol: country.currency,
//         }
//       )
//     }
//   }
// }
