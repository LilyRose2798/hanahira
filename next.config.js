/** @type {import('next').NextConfig} */

const nextConfig = {}

module.exports = (
  process.env.NODE_ENV === "development" ?
    x => require("@next/bundle-analyzer")({
      enabled: process.env.ANALYZE === "true",
    })(x) :
    x => x
)(nextConfig)
