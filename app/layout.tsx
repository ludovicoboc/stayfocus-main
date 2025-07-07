import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/app/components/layout/Header'
import { Footer } from '@/app/components/layout/Footer'
import { Providers } from '@/app/providers'
import { SpeedInsights } from '@vercel/speed-insights/next'

export const metadata: Metadata = {
  title: 'StayFocus',
  description: 'Aplicativo para ajudar pessoas neurodivergentes com organização e produtividade',
  // Atualizar para usar o novo logo como ícone principal
  icons: {
    icon: [
      // Usar o novo logo PNG como ícone principal
      { url: '/images/stayfocus_logo.png', type: 'image/png' }
    ],
    // Manter o logo SVG para Apple touch icon por enquanto, ou podemos mudar se preferir
    apple: '/images/logo.svg',
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
        </Providers>
        <SpeedInsights />
      </body>
    </html>
  )
}
