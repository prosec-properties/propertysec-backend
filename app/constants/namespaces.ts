/**
 * UUID v5 namespaces for consistent ID generation across seeders
 * Each namespace ensures that the same input will always generate the same UUID
 */
export const UUID_NAMESPACES = {
  PLAN: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
  CATEGORY: '6ba7b813-9dad-11d1-80b4-00c04fd430c8',
  SUBCATEGORY: '6ba7b814-9dad-11d1-80b4-00c04fd430c8',
} as const
