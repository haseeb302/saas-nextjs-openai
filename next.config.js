/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdfreader", "pdf2json"],
  },
};

module.exports = nextConfig;
