import { clsx, ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))

export const nullToUndef = <T>(x: T): T & {} | undefined => (x !== null ? x : undefined)

export const titleCase = (name: string) => name.split(" ").map(x => `${x[0].toUpperCase()}${x.substring(1)}`).join(" ")

export const truncate = (val: string, len: number) => (val.length <= len ? val : `${val.slice(0, len - 3)}...`)

export const humanFileSize = (bytes: number, si = false, dp = 1) => {
  const thresh = si ? 1000 : 1024
  if (Math.abs(bytes) < thresh) `${bytes} B`
  const units = si ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"] :
    ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"]
  const r = 10 ** dp
  let b = bytes
  let u = -1
  do {
    b /= thresh
    u += 1
  } while (Math.round(Math.abs(b) * r) / r >= thresh && u < units.length - 1)
  return `${b.toFixed(dp)} ${units[u]}`
}

export const raise = (err: Error | string) => {
  throw err instanceof Error ? err : new Error(err)
}

export const someAsync = async <T>(arr: T[], predicate: (val: T) => Promise<boolean>) => {
  for (const e of arr) if (await predicate(e)) return true
  return false
}

export const everyAsync = async <T>(arr: T[], predicate: (val: T) => Promise<boolean>) => {
  for (const e of arr) if (!await predicate(e)) return false
  return true
}

export type EnhancedOmit<TRecordOrUnion, KeyUnion> = string extends keyof TRecordOrUnion
  ? TRecordOrUnion
  : TRecordOrUnion extends any
  ? Pick<TRecordOrUnion, Exclude<keyof TRecordOrUnion, KeyUnion>>
  : never
