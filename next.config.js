/** @type {import('next').NextConfig} */

const nextConfig = {}

module.exports = (
  process.env.ANALYZE === "true" ?
    x => require("@next/bundle-analyzer")({
      enabled: true,
    })(x) :
    x => x
)(nextConfig)
