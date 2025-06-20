import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/app/components/layout/Header'
import { Footer } from '@/app/components/layout/Footer'
import { Providers } from '@/app/providers'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { ServiceWorkerNotification } from '@/app/components/pwa/ServiceWorkerNotification'
import { InstallPrompt } from '@/app/components/pwa/InstallPrompt'
import { ClientOnly } from '@/app/components/common/ClientOnly'
import { DataProviderInfo } from '@/app/components/debug/DataProviderInfo'

export const metadata: Metadata = {
  title: 'StayFocus',
  description: 'Aplicativo para ajudar pessoas neurodivergentes com organização e produtividade',
  manifest: '/manifest.json',
  themeColor: '#2196F3',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'StayFocus'
  },
  other: {
    'mobile-web-app-capable': 'yes'
  },
  formatDetection: {
    telephone: false
  },
  // Atualizar para usar o novo logo como ícone principal
  icons: {
    icon: [
      // Usar o novo logo PNG como ícone principal
      { url: '/images/stayfocus_logo.png', type: 'image/png' },
      { url: '/icons/icon-192x192.svg', sizes: '192x192', type: 'image/svg+xml' },
      { url: '/icons/icon-512x512.svg', sizes: '512x512', type: 'image/svg+xml' }
    ],
    // Usar ícone SVG para Apple touch icon
    apple: '/icons/icon-192x192.svg',
  },
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

          {/* Componentes PWA - apenas no cliente */}
          <ClientOnly>
            <ServiceWorkerNotification />
          </ClientOnly>
          <ClientOnly>
            <InstallPrompt />
          </ClientOnly>
          <ClientOnly>
            <DataProviderInfo />
          </ClientOnly>

        </Providers>
        <SpeedInsights />
      </body>
    </html>
  )
}
