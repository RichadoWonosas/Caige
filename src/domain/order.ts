export function shuffled<T>(items: readonly T[]): T[] {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1))
    ;[result[index], result[target]] = [result[target], result[index]]
  }
  return result
}

export const byCreatedAt = <T extends { createdAt: string }>(items: readonly T[]): T[] =>
  [...items].sort((left, right) => left.createdAt.localeCompare(right.createdAt) || JSON.stringify(left).localeCompare(JSON.stringify(right)))
