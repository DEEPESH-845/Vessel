import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Syne } from "next/font/google";
import { GlobalCursorGlow } from "@/components/global-cursor-glow";
import "./globals.css";
import { AppProvider } from "@/lib/store";
import { SmoothScrollProvider } from "@/components/smooth-scroll-provider";
import PerformanceMonitor from "@/components/performance-monitor";
import { UserProvider } from "@/components/user-provider";
import { LenisProvider } from "@/components/providers/LenisProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500"],
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Vessel - Gasless Crypto Payments",
  description: "The gasless payment layer for the stablecoin economy. Zero gas. One tap. Instant.",
  keywords: ["crypto", "payments", "stablecoin", "gasless", "ERC-4337", "web3", "blockchain", "Lisk"],
  authors: [{ name: "Vessel Team" }],
  creator: "Vessel",
  publisher: "Vessel",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
  openGraph: {
    title: "Vessel - Gasless Crypto Payments",
    description: "The gasless payment layer for the stablecoin economy. Zero gas. One tap. Instant.",
    url: "/",
    siteName: "Vessel",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vessel - Gasless Crypto Payments",
    description: "The gasless payment layer for the stablecoin economy. Zero gas. One tap. Instant.",
    creator: "@vessel",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Vessel",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#CCFF00",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${syne.variable} font-sans antialiased bg-black text-white selection:bg-[#00ff41] selection:text-black cursor-none`}
        suppressHydrationWarning
      >
        <GlobalCursorGlow />
        <LenisProvider>
          {/* Main Content */}
          <UserProvider>
            <AppProvider>
              {children}
              <PerformanceMonitor />
            </AppProvider>
          </UserProvider>
        </LenisProvider>
      </body>
    </html>
  );
}