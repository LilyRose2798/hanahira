import { Metadata } from "next"
import SwaggerUI from "@/components/swagger/SwaggerUI"

export const metadata: Metadata = { title: "API" }

const ApiDoc = async () => (
  <section className="container">
    <SwaggerUI />
  </section>
)

export default ApiDoc
