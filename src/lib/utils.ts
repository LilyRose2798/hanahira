import { clsx, ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))
export const nullToUndef = <T>(x: T): T & {} | undefined => (x !== null ? x : undefined)
export const titleCase = (name: string) => name.split(" ").map(x => `${x[0].toUpperCase()}${x.substring(1)}`).join(" ")

export type EnhancedOmit<TRecordOrUnion, KeyUnion> = string extends keyof TRecordOrUnion
  ? TRecordOrUnion
  : TRecordOrUnion extends any
  ? Pick<TRecordOrUnion, Exclude<keyof TRecordOrUnion, KeyUnion>>
  : never
