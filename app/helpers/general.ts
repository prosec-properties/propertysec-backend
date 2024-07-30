export const setSearchParams = (params: Record<string, any>): string => {
  // const searchParams = new URLSearchParams()

  // for (const [key, value] of Object.entries(params)) {
  //   searchParams.set(key, String(value))
  // }

  // return searchParams.toString()

  return new URLSearchParams(params).toString()
}
