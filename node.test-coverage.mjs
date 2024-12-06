export default async function* cover(source) {
  for await (const { data, type } of source) {
    switch (type) {
      case 'test:coverage':
        yield JSON.stringify({
          summary: {
            totals: {
              coveredLinePercent: Math.round(data.summary.totals.coveredLinePercent),
            },
          },
        })

        break
      default:
        break
    }
  }
}
