export async function clearCache(name: string): Promise<void> {
  const cache = await caches.open(name)

  await Promise.all(
    (await cache.keys()).map(async (key) => {
      await cache.delete(key)
    }),
  )
}
