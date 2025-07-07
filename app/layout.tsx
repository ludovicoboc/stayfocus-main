import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/app/components/layout/Header'
import { Footer } from '@/app/components/layout/Footer'
import { Providers } from '@/app/providers'
import { PWAInstallPrompt } from '@/app/components/PWAInstallPrompt'
import { PWAUpdateNotification, SyncStatusIndicator } from '@/app/components/PWAUpdateNotification'
import { SpeedInsights } from '@vercel/speed-insights/next'

export const metadata: Metadata = {
  title: 'StayFocus',
  description: 'Aplicativo para ajudar pessoas neurodivergentes com organização e produtividade',
  manifest: '/manifest.json',
  themeColor: '#3b82f6',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover'
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'StayFocus'
  },
  formatDetection: {
    telephone: false
  },
  openGraph: {
    type: 'website',
    siteName: 'StayFocus',
    title: 'StayFocus - Painel Neurodivergentes',
    description: 'Aplicativo para ajudar pessoas neurodivergentes com organização e produtividade'
  },
  twitter: {
    card: 'summary',
    title: 'StayFocus - Painel Neurodivergentes',
    description: 'Aplicativo para ajudar pessoas neurodivergentes com organização e produtividade'
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png', sizes: '32x32' },
      { url: '/images/stayfocus_logo.png', type: 'image/png', sizes: '192x192' },
      { url: '/images/stayfocus_logo.png', type: 'image/png', sizes: '512x512' }
    ],
    apple: [
      { url: '/images/stayfocus_logo.png', sizes: '180x180', type: 'image/png' }
    ]
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'StayFocus',
    'application-name': 'StayFocus',
    'msapplication-TileColor': '#3b82f6',
    'msapplication-config': 'none'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="bg-gray-50 dark:bg-gray-900">
        <Providers>
          <div className="flex h-screen overflow-hidden">
            <div className="flex flex-col flex-1 overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto p-4">
                {children}
                <Footer />
              </main>
            </div>
          </div>
        </Providers>
        <PWAInstallPrompt />
        <PWAUpdateNotification />
        <SyncStatusIndicator />
        <SpeedInsights />
      </body>
    </html>
  )
}
