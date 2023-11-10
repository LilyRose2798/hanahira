"use client"
import SwaggerUIReact from "swagger-ui-react"
import "swagger-ui-react/swagger-ui.css"
import "./swagger-ui.css"
import "./swagger-ui-dark.css"

export const SwaggerUI = () => <SwaggerUIReact url="/api/openapi.json" />
export default SwaggerUI
