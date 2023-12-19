/** @type {import('next').NextConfig} */

const nextConfig = {
  webpack: config => ({ ...config, optimization: { ...config.optimization, minimize: process.env.NO_MINIFY !== "true" } }),
}

module.exports = (
  process.env.ANALYZE === "true" ?
    x => require("@next/bundle-analyzer")({
      enabled: true,
    })(x) :
    x => x
)(nextConfig)
