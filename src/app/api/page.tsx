import { Metadata } from "next"
import SwaggerUI from "@/components/swagger/SwaggerUI"

const title = "API"
export const metadata: Metadata = { title }

const ApiDoc = async () => (
  <section className="container">
    <SwaggerUI />
  </section>
)

export default ApiDoc
