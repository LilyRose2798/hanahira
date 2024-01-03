import { createTransport, SendMailOptions } from "nodemailer"
import { env } from "@/lib/env.mjs"

const transporter = createTransport(env.EMAIL_SERVER)

export const sendMail = (opts: Omit<SendMailOptions, "from">) => transporter.sendMail({ ...opts, from: env.EMAIL_FROM })
