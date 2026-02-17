export let cache: Cache | null = null

export async function openCache(name: string): Promise<void> {
  cache = await caches.open(name)
}
