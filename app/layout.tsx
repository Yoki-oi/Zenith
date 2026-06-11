import type { Metadata } from 'next'
import { Inter, DM_Sans, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Nexus - JEE Syllabus Tracker',
  description: 'Track your JEE syllabus, monitor progress across Physics, Chemistry and Maths, and stay ahead with your friends.',
  metadataBase: new URL('https://nexus-jee.vercel.app'),
  openGraph: {
    title: 'Nexus - JEE Syllabus Tracker',
    description: 'Track your JEE syllabus, monitor progress across Physics, Chemistry and Maths, and stay ahead with your friends.',
    url: 'https://nexus-jee.vercel.app',
    siteName: 'Nexus',
    images: [{ url: '/og', width: 1200, height: 630, alt: 'Nexus - JEE Syllabus Tracker' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nexus - JEE Syllabus Tracker',
    description: 'Track your JEE syllabus, monitor progress and stay ahead with your friends.',
    images: ['/og'],
  },
  manifest: '/manifest.json',
  themeColor: '#0a0d14',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Nexus',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased bg-background min-h-screen">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
