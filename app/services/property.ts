import Property from '#models/property'

interface PropertyFilters {
  status?: string
  categories?: string
  locations?: string
  pricing?: string
  search?: string
}

interface FetchPropertiesOptions {
  page: number
  limit: number
  filters: PropertyFilters
  isAdmin: boolean
}

export default class PropertyService {
  private static parseJson(value?: string) {
    if (!value) {
      return null
    }

    try {
      return JSON.parse(value)
    } catch {
      return null
    }
  }

  static async fetchProperties({ page, limit, filters, isAdmin }: FetchPropertiesOptions) {
    const { status: rawStatus, categories, locations, pricing, search } = filters

    const normalizedStatus = rawStatus?.toString().trim().toLowerCase()
    const effectiveStatus = normalizedStatus && normalizedStatus !== 'all' ? normalizedStatus : null
    const statusIsSold = effectiveStatus === 'sold'

    const properties = await Property.query()
      .if(!isAdmin, (query) => {
        if (!statusIsSold) {
          query.where('availability', '!=', 'sold')
        }

        if (!effectiveStatus) {
          query.where('status', 'published')
        }
      })
      .if(effectiveStatus, (query) => {
        if (statusIsSold) {
          query.where('availability', 'sold')
        } else {
          query.where('status', effectiveStatus!)
        }
      })
      .if(search, (query) => {
        query.where((builder) => {
          builder.where('title', 'ilike', `%${search}%`)
          builder.orWhere('address', 'ilike', `%${search}%`)
        })
      })
      .if(categories, (query) => {
        const parsedCategories = this.parseJson(categories)
        if (Array.isArray(parsedCategories)) {
          query.whereIn('categoryId', parsedCategories)
        }
      })
      .if(locations, (query) => {
        const parsedLocations = this.parseJson(locations)
        if (Array.isArray(parsedLocations)) {
          query.whereIn('stateId', parsedLocations)
        }
      })
      .if(pricing, (query) => {
        const parsedPricing = this.parseJson(pricing)
        const pricingArray = Array.isArray(parsedPricing)
          ? parsedPricing
          : parsedPricing
            ? [parsedPricing]
            : []

        pricingArray.forEach((priceFilter) => {
          if (typeof priceFilter !== 'string') {
            return
          }
          const match = priceFilter.match(/(\d+)([+-])/)
          if (match) {
            const [, priceValue, operator] = match
            const price = parseInt(priceValue, 10)
            if (operator === '+') {
              query.where('price', '>=', price)
            } else if (operator === '-') {
              query.where('price', '<=', price)
            }
          }
        })
      })
      .preload('files')
      .preload('category')
      .preload('state')
      .preload('user', (userQuery) => {
        userQuery.preload('subscription', (subscriptionQuery) => {
          subscriptionQuery.preload('plan')
        })
      })
      .orderBy('created_at', 'desc')
      .paginate(page, limit)

    const propertiesJSON = properties.toJSON() as { data: any[]; meta: any }

    const rankedData = propertiesJSON.data.map((property) => {
      const cleanProperty = {
        id: property.id,
        userId: property.userId,
        affiliateId: property.affiliateId,
        countryId: property.countryId,
        stateId: property.stateId,
        cityId: property.cityId,
        address: property.address,
        title: property.title,
        categoryId: property.categoryId,
        type: property.type,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        toilets: property.toilets,
        street: property.street,
        price: property.price,
        currency: property.currency,
        append: property.append,
        description: property.description,
        views: property.views,
        availability: property.availability,
        status: property.status,
        defaultImageUrl: property.defaultImageUrl,
        meta: property.meta,
        createdAt: property.createdAt,
        updatedAt: property.updatedAt,
        files: property.files
          ? property.files.map((file: any) => ({
              id: file.id,
              propertyId: file.propertyId,
              url: file.url,
              type: file.type,
              size: file.size,
              mimeType: file.mimeType,
              isDefault: file.isDefault,
              meta: file.meta,
              createdAt: file.createdAt,
              updatedAt: file.updatedAt,
            }))
          : [],
        user: property.user
          ? {
              id: property.user.id,
              email: property.user.email,
              emailVerified: property.user.emailVerified,
              authProvider: property.user.authProvider,
              role: property.user.role,
              fullName: property.user.fullName,
              slug: property.user.slug,
              phoneNumber: property.user.phoneNumber,
              avatarUrl: property.user.avatarUrl,
              isVerified: property.user.isVerified,
              hasCompletedProfile: property.user.hasCompletedProfile,
              hasCompletedRegistration: property.user.hasCompletedRegistration,
              createdAt: property.user.createdAt,
              updatedAt: property.user.updatedAt,
              subscriptionId: property.user.subscriptionId,
              subscriptionStatus: property.user.subscriptionStatus,
              subscriptionStartDate: property.user.subscriptionStartDate,
              subscriptionEndDate: property.user.subscriptionEndDate,
              subscription: property.user.subscription
                ? {
                    id: property.user.subscription.id,
                    userId: property.user.subscription.userId,
                    planId: property.user.subscription.planId,
                    status: property.user.subscription.status,
                    startDate: property.user.subscription.startDate,
                    endDate: property.user.subscription.endDate,
                    plan: property.user.subscription.plan
                      ? {
                          id: property.user.subscription.plan.id,
                          name: property.user.subscription.plan.name,
                          description: property.user.subscription.plan.description,
                          price: property.user.subscription.plan.price,
                          currency: property.user.subscription.plan.currency,
                          features: property.user.subscription.plan.features,
                          maxProperties: property.user.subscription.plan.maxProperties,
                          isActive: property.user.subscription.plan.isActive,
                          createdAt: property.user.subscription.plan.createdAt,
                          updatedAt: property.user.subscription.plan.updatedAt,
                        }
                      : null,
                  }
                : null,
            }
          : null,
        category: property.category
          ? {
              id: property.category.id,
              name: property.category.name,
            }
          : null,
        state: property.state
          ? {
              id: property.state.id,
              name: property.state.name,
            }
          : null,
      }

      const planName = cleanProperty.user?.subscription?.plan?.name || null
      let rankScore = 5

      if (planName === 'UNLIMITED') rankScore = 1
      else if (planName === 'PLATINUM') rankScore = 2
      else if (planName === 'GOLD') rankScore = 3
      else if (planName === 'SILVER') rankScore = 4
      else if (planName === 'FREE') rankScore = 5

      return {
        ...cleanProperty,
        _rank: rankScore,
      }
    })

    rankedData.sort((a, b) => {
      if (a._rank !== b._rank) {
        return a._rank - b._rank
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return {
      meta: propertiesJSON.meta,
      data: rankedData,
    }
  }
}
