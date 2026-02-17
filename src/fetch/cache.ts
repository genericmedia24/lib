import { cache } from './open-cache.js'

export async function fetchCache(input: RequestInfo | URL): Promise<Response | undefined> {
  return cache?.match(input)
}
