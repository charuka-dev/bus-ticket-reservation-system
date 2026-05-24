export type ClassValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | ClassValue[]
  | { [key: string]: boolean | undefined | null }

export function cn(...inputs: ClassValue[]) {
  return inputs
    .flatMap((input) => {
      if (Array.isArray(input)) return input
      if (input && typeof input === "object" && !Array.isArray(input)) {
        return Object.entries(input)
          .filter(([, value]) => Boolean(value))
          .map(([key]) => key)
      }
      return input ? [String(input)] : []
    })
    .filter(Boolean)
    .join(" ")
}
