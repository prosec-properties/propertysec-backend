import Category from '#models/category'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    const categories = [
      {
        name: 'rent',
      },
      {
        name: 'sale',
      },
      {
        name: 'lease',
      },
      {
        name: 'shortlet',
      },
    ]

    for (const category of categories) {
      await Category.updateOrCreate(
        { name: category.name },
        {
          name: category.name,
        }
      )
    }
    // Write your database queries inside the run method
  }
}
