import { toDataURL } from "qrcode"
import { raise, someAsync } from "@/lib/utils"

export const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
const BASE32_ALPHABET_IND = Object.fromEntries([...BASE32_ALPHABET].map((x, i) => [x, i]))

export const base32Encode = (data: ArrayBuffer, padding: boolean = false) => {
  let bits = 0
  let value = 0
  let output = ""
  for (const i of new Uint8Array(data).values()) {
    value = (value << 8) | i
    bits += 8
    while (bits >= 5) output += BASE32_ALPHABET[(value >>> (bits -= 5)) & 31]
  }
  if (bits > 0) output += BASE32_ALPHABET[(value << (5 - bits)) & 31]
  if (padding) while ((output.length % 8) !== 0) output += "="
  return output
}

export const base32Decode = (data: string) => {
  const indices = [...data.replace(/=+$/, "").toUpperCase()].map(c => BASE32_ALPHABET_IND[c])
  if (indices.some(i => i === undefined)) throw new Error("Invalid base32 characters")
  let bits = 0
  let value = 0
  let index = -1
  const output = new Uint8Array(indices.length * 5 / 8)
  for (const i of indices) {
    value = (value << 5) | i
    bits += 5
    if (bits >= 8) output[index += 1] = (value >>> (bits -= 8)) & 255
  }
  return output.buffer
}

export type OTPKey = string | ArrayBuffer | CryptoKey
export type OTPAlgorithm = "SHA-1" | "SHA-256" | "SHA-512"
export type OTPOpts = { digits?: number, algorithm?: OTPAlgorithm }

export const DEFAULT_OTP_KEY_BYTES = 20
export const DEFAULT_OTP_DIGITS = 6
export const DEFAULT_OTP_ALGORITHM = "SHA-1" satisfies OTPAlgorithm
export const DEFAULT_OTP_PERIOD = 30

// export const generateOTPKey = async (bytes: number = DEFAULT_OTP_KEY_BYTES) => (await crypto.subtle.exportKey("raw", await crypto.subtle.generateKey({ name: "HMAC", hash: "SHA-1" }, true, ["sign"]))).slice(0, bytes)
export const generateOTPKey = async (bytes: number = DEFAULT_OTP_KEY_BYTES) => crypto.getRandomValues(new Uint8Array(bytes)).buffer

type CounterOpts = { counter: number }
export type HOTPOpts = OTPOpts & CounterOpts
type WindowOpts = { window?: number }
type OffsetOpts = { offset?: number }

export const generateHOTP = async (key: OTPKey, { counter, digits = DEFAULT_OTP_DIGITS, algorithm = DEFAULT_OTP_ALGORITHM }: HOTPOpts) => {
  if (digits < 1) raise("OTP digits must be greater than 0")
  const counterArr = new ArrayBuffer(8)
  new DataView(counterArr).setBigUint64(0, BigInt(counter))
  const cryptoKey = key instanceof CryptoKey ? key :
    await crypto.subtle.importKey("raw", typeof key === "string" ?
      base32Decode(key) : key, { name: "HMAC", hash: algorithm }, false, ["sign"])
  const signedArr = await crypto.subtle.sign("HMAC", cryptoKey, counterArr)
  const offset = new Uint8Array(signedArr).at(-1)! & 15
  const num = new DataView(signedArr).getUint32(offset) & 0x7fffffff
  const trunc = num % 10 ** digits
  return trunc.toString().padStart(digits, "0")
}

const generateWindowOffsets = (window: number = 0) => (
  window < 0 ? raise("OTP window must be 0 or more") :
    [0, ...[...Array(Math.abs(window))].map((_, i) => i + 1).flatMap(x => [x, -x])])

export const verifyHOTP = async (hotp: string, key: OTPKey, { window, ...opts }: HOTPOpts & WindowOpts) => (
  someAsync(generateWindowOffsets(window), async offset => hotp === await generateHOTP(key, { ...opts, counter: opts.counter + offset })))

type PeriodOpts = { period?: number }
export type TOTPOpts = OTPOpts & PeriodOpts
type DateOpts = { date?: Date }

export const generateTOTPCounter = ({ period = DEFAULT_OTP_PERIOD, date = new Date() }: PeriodOpts & DateOpts) => (
  Math.floor(date.getTime() / (period * 1000)))

export const generateTOTP = async (key: OTPKey, { period, date, offset = 0, ...opts }: TOTPOpts & DateOpts & OffsetOpts = {}) => (
  generateHOTP(key, { counter: generateTOTPCounter({ period, date }) + offset, ...opts }))

export const verifyTOTP = async (totp: string, key: OTPKey, { window, ...opts }: TOTPOpts & WindowOpts = {}) => (
  someAsync(generateWindowOffsets(window), async offset => totp === await generateTOTP(key, { ...opts, offset })))

export type OTPURIOpts = (HOTPOpts | TOTPOpts) & { issuer?: string } & ({} | { name: string } | { label: string, user: string })

export const generateOTPURL = async (key: OTPKey, { digits, algorithm, issuer, ...opts }: OTPURIOpts = {}) => {
  const isHOTP = "counter" in opts
  const type = isHOTP ? "hotp" : "totp"
  const name = "name" in opts ? opts.name :
    "label" in opts ? `${opts.label ?? ""}:${opts.user ?? ""}` : ""
  const url = new URL(`otpauth://${type}/${name}`)
  url.searchParams.set("secret", typeof key === "string" ? key :
    base32Encode(key instanceof CryptoKey ?
      await crypto.subtle.exportKey("raw", key) : key))
  if (issuer !== undefined) url.searchParams.set("issuer", issuer)
  if (digits !== undefined) url.searchParams.set("digits", digits.toString())
  if (algorithm !== undefined) url.searchParams.set("algorithm", algorithm.replace("-", ""))
  if (isHOTP) url.searchParams.set("counter", opts.counter.toString())
  else if (opts.period !== undefined) url.searchParams.set("period", opts.period.toString())
  return url.toString()
}

export const parseOTPURL = async (url: string | URL) => {
  const x = new URL(url)
  if (x.protocol !== "otpauth:") raise("Invalid OTP URL protocol")
  const name = decodeURIComponent(x.pathname.slice(1))
  const param = <T extends string, U = string>(name: T, parse?: (x: string) => U) => {
    const param = x.searchParams.get(name)
    return (param === null ? {} : { [name]: parse ? parse(param) : param }) as { [K in T]?: U }
  }
  return {
    ...(x.hostname === "hotp" ? { type: "hotp" as const, ...param("counter", x => +x) } :
      x.hostname === "totp" ? { type: "totp" as const, ...param("period", x => +x) } :
        raise("Invalid OTP URL type")),
    ...(name.includes(":") ?
      (([_, label, user]) => ({ label, user }))(name.match(/^(.*?):(.*?)$/) ?? raise("Invalid OTP URL name")) :
      { name }),
    key: x.searchParams.get("secret") ?? raise("Invalid OTP URL key"),
    ...param("issuer"),
    ...param("digits", x => +x),
    ...param("algorithm", (x): OTPAlgorithm => (
      x === "SHA1" ? "SHA-1" :
        x === "SH256" ? "SHA-256" :
          x === "SHA512" ? "SHA-512" :
            raise("Invalid OTP URL algorithm"))),
  }
}

export const generateOTPDataURL = (...args: Parameters<typeof generateOTPURL>) => generateOTPURL(...args).then(url => toDataURL(url))
