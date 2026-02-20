import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ResumeAI — AI-Powered Resume Optimizer',
  description:
    'Upload your resume and paste a job description. Claude AI deconstructs the JD, scores your fit, and rewrites every bullet with achievement-based language — then delivers an ATS-safe DOCX download.',
  keywords: ['resume optimizer', 'ATS resume', 'AI resume writer', 'job application'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  )
}
