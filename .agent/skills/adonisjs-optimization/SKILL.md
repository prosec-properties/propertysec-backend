# AdonisJS Optimization Skill

High-performance patterns and best practices for AdonisJS v6 applications.

## Performance Optimization Patterns

### 1. Database Query Optimization

#### Eager Loading (N+1 Prevention)
Always use `.preload()` for relationships to avoid N+1 query problems.
```typescript
// Good
const properties = await Property.query().preload('category').preload('user')

// Even Better: Selective Column Loading
const properties = await Property.query()
  .preload('user', (query) => query.select('id', 'fullName', 'email'))
```

#### Selective Column Loading
Don't fetch columns you don't need, especially large text fields or sensitive data.
```typescript
const users = await User.query().select('id', 'fullName', 'email')
```

### 2. Official @adonisjs/cache (BentoCache)

For frequently accessed data that rarely changes (categories, countries, settings), use the official `@adonisjs/cache` service.

```typescript
import cache from '@adonisjs/cache/services/main'

const countries = await cache.getOrSet({
  key: 'countries',
  factory: async () => await Country.all(),
  ttl: '10m'
})
```

**Key Patterns:**
- **Serialization**: Always use `.toJSON()` or manual mapping in the factory, as models cannot be stored directly.
- **TTL**: Use string-based durations like `'1m'`, `'5m'`, `'10m'`.
- **Invalidation**: Use `await cache.delete({ key: '...' })` after mutations.

### 3. HTTP Layer Optimizations

#### Async Local Storage
Enable in `config/app.ts` to access HTTP context from anywhere without prop-drilling.
```typescript
// config/app.ts
useAsyncLocalStorage: true
```

#### Connection Pooling
Tuning the PostgreSQL pool is critical for concurrency.
```typescript
// config/database.ts
pool: {
  min: 2,
  max: 20, // Increased for concurrent load
  idleTimeoutMillis: 10000, // Release connections faster
}
```

### 4. Error Handling Guidelines

Always provide structured responses in the `ExceptionHandler`.

**Production Rule:** Never leak stack traces or internal error details to the client in production. Use a generic "Internal Server Error" for 500s.

```typescript
if (app.inProduction) {
  return ctx.response.status(500).send({
    success: false,
    message: 'An internal server error occurred.',
  })
}
```

## Security Best Practices

### 1. Sensitive Data Masking
Ensure sensitive fields are marked as `serializeAs: null` in models.
```typescript
@column({ serializeAs: null })
declare password: string
```

### 2. Rate Limiting
Always enable rate limiting on authentication and sensitive write endpoints using `@adonisjs/limiter`.

## Development Workflow

1. **Validators First**: Always use VineJS validators for every request.
2. **Services for Logic**: Keep controllers thin by moving business logic to services.
3. **Type Safety**: Leverage TypeScript's strict mode and interface definitions for all payloads.
