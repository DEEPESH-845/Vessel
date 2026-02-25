import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/store";
import { SmoothScrollProvider } from "@/components/smooth-scroll-provider";
import PerformanceMonitor from "@/components/performance-monitor";
import { UserProvider } from "@/components/user-provider";

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

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
  weight: ["400", "500", "600", "700"],
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
        className={`${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable} font-sans antialiased bg-[#060b14] text-white selection:bg-primary/30 selection:text-white`}
        suppressHydrationWarning
      >
        {/* Background Effects - Fixed to viewport */}
        <div
          className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none"
          aria-hidden="true"
        >
          {/* Top left purple glow */}
          <div
            className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.12]"
            style={{
              background: "radial-gradient(circle, #6366f1 0%, transparent 70%)",
            }}
          />
          {/* Bottom right teal glow */}
          <div
            className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full blur-[100px] opacity-[0.08]"
            style={{
              background: "radial-gradient(circle, #14b8a6 0%, transparent 70%)",
            }}
          />
          {/* Center subtle blue glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[150px] opacity-[0.05]"
            style={{
              background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)",
            }}
          />
        </div>

        {/* Main Content */}
        <UserProvider>
          <AppProvider>
            <SmoothScrollProvider>
              {children}
              <PerformanceMonitor />
            </SmoothScrollProvider>
          </AppProvider>
        </UserProvider>
      </body>
    </html>
  );
}