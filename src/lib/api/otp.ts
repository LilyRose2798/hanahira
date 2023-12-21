export const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
const BASE32_ALPHABET_IND = Object.fromEntries([...BASE32_ALPHABET].map((x, i) => [x, i]))

export const base32Encode = (data: ArrayBufferLike, padding: boolean = false) => {
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

// export const generateOTPKey = async (length: number = 10) => (await crypto.subtle.exportKey("raw", await crypto.subtle.generateKey({ name: "HMAC", hash: "SHA-1" }, true, ["sign"]))).slice(0, length)
export const generateOTPKey = async (length: number = 10) => crypto.getRandomValues(new Uint8Array(length)).buffer

export type OTPOpts = { digits?: 6 | 8, algorithm?: "SHA-1" | "SHA-256" | "SHA-512" }

export type HOTPOpts = OTPOpts & { counter: number }

export const generateHOTP = async (key: string | ArrayBuffer | CryptoKey, { counter, digits = 6, algorithm = "SHA-1" }: HOTPOpts) => {
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

export const verifyHOTP = async (hotp: string, ...args: Parameters<typeof generateHOTP>) => hotp === await generateHOTP(...args)

export type TOTPOpts = OTPOpts & { period?: number }

export const generateTOTP = async (key: string | ArrayBuffer | CryptoKey, { period = 30, ...opts }: TOTPOpts = {}) => (
  generateHOTP(key, { counter: Math.floor(Date.now() / (period * 1000)), ...opts }))

export const verifyTOTP = async (totp: string, ...args: Parameters<typeof generateTOTP>) => totp === await generateTOTP(...args)

export type OTPURIOpts = (HOTPOpts | TOTPOpts) & { name?: string, issuer?: string }

export const generateOTPURI = async (key: string | ArrayBuffer | CryptoKey, { digits, algorithm, name = "", issuer, ...opts }: OTPURIOpts = {}) => {
  const uri = new URL(`otpauth://totp/${name}`)
  uri.searchParams.set("secret", typeof key === "string" ? key :
    base32Encode(key instanceof CryptoKey ?
      await crypto.subtle.exportKey("raw", key) : key))
  if (issuer) uri.searchParams.set("issuer", issuer)
  if (digits) uri.searchParams.set("digits", digits.toString())
  if (algorithm) uri.searchParams.set("algorithm", algorithm.replace("-", ""))
  if ("counter" in opts) uri.searchParams.set("counter", opts.counter.toString())
  if ("period" in opts && opts.period) uri.searchParams.set("period", opts.period.toString())
  return uri.toString()
}
