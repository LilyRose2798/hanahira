import { clsx, ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))
export const nullToUndef = <T>(x: T): T & {} | undefined => (x !== null ? x : undefined)
