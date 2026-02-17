import { cache } from './open-cache.js'

export async function fetchNetworkCache(input: RequestInfo | URL, init?: RequestInit): Promise<Response | undefined> {
  try {
    const response = await fetch(input, init)

    await cache?.put(input, response.clone())

    return response
  } catch (error: unknown) {
    return cache?.match(input)
  }
}
