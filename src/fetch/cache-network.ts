import { cache } from './open-cache.js'

export async function fetchCacheNetwork(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  let response = await cache?.match(input)

  if (response !== undefined) {
    return response
  }

  response = await fetch(input, init)
  await cache?.put(input, response.clone())

  return response
}
