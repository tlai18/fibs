import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Guess Who's Lying - Social Deduction Game",
    template: "%s | Guess Who's Lying"
  },
  description: "Play Guess Who's Lying online! A fast-paced social deduction party game where players must identify the liar among them. Free to play, no downloads required. Perfect for friends, family, and parties.",
  keywords: [
    "social deduction game",
    "party game",
    "online game",
    "free game",
    "liar game",
    "detective game",
    "group game",
    "friends game",
    "family game",
    "multiplayer game",
    "browser game",
    "no download game",
    "real-time game",
    "social game",
    "bluffing game",
    "deception game"
  ],
  authors: [{ name: "Guess Who's Lying Team" }],
  creator: "Guess Who's Lying",
  publisher: "Guess Who's Lying",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
          metadataBase: new URL('https://guess-whos-lying.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Guess Who's Lying - Social Deduction Game",
    description: "Play Guess Who's Lying online! A fast-paced social deduction party game where players must identify the liar among them. Free to play, no downloads required.",
             url: 'https://guess-whos-lying.vercel.app',
    siteName: "Guess Who's Lying",
    images: [
      {
        url: '/og-image.png', // We'll create this
        width: 1200,
        height: 630,
        alt: "Guess Who's Lying - Social Deduction Game",
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Guess Who's Lying - Social Deduction Game",
    description: "Play Guess Who's Lying online! A fast-paced social deduction party game where players must identify the liar among them.",
    images: ['/og-image.png'], // We'll create this
    creator: '@guesswhoslying', // Update with your actual Twitter handle
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
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  category: 'games',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Guess Who's Lying",
    "description": "A fast-paced social deduction party game where players must identify the liar among them. Free to play online, no downloads required.",
             "url": "https://guess-whos-lying.vercel.app",
    "applicationCategory": "GameApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "genre": "Social Deduction Game",
    "gamePlatform": "Web Browser",
    "numberOfPlayers": {
      "@type": "QuantitativeValue",
      "minValue": 2,
      "maxValue": 8
    },
    "playMode": "MultiPlayer",
    "gameLocation": "Online",
    "publisher": {
      "@type": "Organization",
      "name": "Guess Who's Lying Team"
    },
             "screenshot": "https://guess-whos-lying.vercel.app/og-image.png",
    "featureList": [
      "Real-time multiplayer",
      "No registration required",
      "Cross-platform compatible",
      "Customizable avatars",
      "Multiple game modes",
      "Instant party creation"
    ]
  };

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}
