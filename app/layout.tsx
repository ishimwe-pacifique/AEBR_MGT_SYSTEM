import type { Metadata } from 'next'
import { Inter, Inter as InterMono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import Providers from '@/components/Providers'
import './globals.css'

const _inter = Inter({ subsets: ["latin"] });
const _interMono = InterMono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'AEBR CMS - Church Management System',
  description: 'Transforming Church Administration through Digital Excellence. Manage memberships, finances, and ministries across all your churches.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
