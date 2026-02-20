/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['mammoth', 'pdfjs-dist', 'docx'],
  // Turbopack is default in Next.js 16 — canvas alias handled via serverExternalPackages
  turbopack: {},
}

module.exports = nextConfig
