import React from "react"
import type { Metadata, Viewport } from 'next'
import { Instrument_Sans, Instrument_Serif, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'

const instrumentSans = Instrument_Sans({ 
  subsets: ["latin"],
  variable: '--font-instrument'
});

const instrumentSerif = Instrument_Serif({ 
  subsets: ["latin"],
  weight: "400",
  variable: '--font-instrument-serif'
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: '--font-jetbrains'
});

export const viewport: Viewport = {
  themeColor: '#000000',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL('https://wizardw2.vercel.app'),
  title: {
    default: 'Wizard — Local-First Autonomous AI Data Analyst',
    template: '%s · Wizard',
  },
  description: 'Open-source local AI Data Analyst workspace. Ask questions about your data, watch it compute via DuckDB & Polars, verify statistical invariants, and render interactive 3D/2D Plotly charts with zero cloud data leakage.',
  applicationName: 'Wizard',
  authors: [{ name: 'Aniket Saha', url: 'https://github.com/Aniket-a14' }],
  generator: 'Next.js',
  keywords: [
    'AI data analyst',
    'autonomous data analysis',
    'local AI',
    'DuckDB',
    'Polars',
    'Ollama',
    'DeepSeek-R1',
    'open source Julius AI alternative',
    'Claude Artifacts data analysis',
    'CodeGuard AST sandbox',
    'private data science',
    'SQL AI agent',
    'Plotly interactive visualization',
    'data exploration tool',
  ],
  referrer: 'origin-when-cross-origin',
  creator: 'Aniket Saha',
  publisher: 'Wizard-AIA',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: 'https://wizardw2.vercel.app',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://wizardw2.vercel.app',
    title: 'Wizard — Local-First Autonomous AI Data Analyst',
    description: '100% private, local-first AI data analyst powered by DuckDB, Polars, and isolated AST code sandboxing. Zero telemetry, zero cloud lock-in.',
    siteName: 'Wizard',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Wizard — Autonomous AI Data Analyst',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wizard — Local-First Autonomous AI Data Analyst',
    description: 'Private, autonomous AI data analyst workspace. Runs locally on your hardware with Ollama, DeepSeek-R1, and DuckDB.',
    images: ['/images/og-image.png'],
    creator: '@Aniket_a14',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Wizard',
      headline: 'Local-first autonomous AI data analysis agent',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'macOS, Linux, Windows',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      description: 'An open-source local AI Data Analyst workspace that investigates, writes and executes Python/SQL code, verifies results, and renders interactive visualizations.',
      url: 'https://wizardw2.vercel.app',
      downloadUrl: 'https://wizardw2.vercel.app/download',
      softwareVersion: '1.0.8',
      license: 'https://opensource.org/licenses/BSD-3-Clause',
      author: {
        '@type': 'Person',
        name: 'Aniket Saha',
        url: 'https://github.com/Aniket-a14',
      },
    },
    {
      '@type': 'Organization',
      name: 'Wizard-AIA',
      url: 'https://wizardw2.vercel.app',
      logo: 'https://wizardw2.vercel.app/icon.png',
      sameAs: [
        'https://github.com/Wizard-AIA',
        'https://github.com/Wizard-AIA/Wizard-w2',
      ],
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${instrumentSans.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} font-sans antialiased bg-black text-white`}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
