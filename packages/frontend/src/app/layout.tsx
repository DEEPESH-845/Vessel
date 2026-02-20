import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/store";

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
  title: "Vessel — Gasless Payments",
  description: "Zero gas. One tap. Instant stablecoin settlement on Lisk.",
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
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f0f0f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable} font-sans antialiased bg-[#0f0f0f] text-white selection:bg-primary/30 selection:text-white`}
      >
        <div className="layout-shell">
          <div
            className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none"
            aria-hidden="true"
          >
            <div
              className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.15]"
              style={{
                background:
                  "radial-gradient(circle, #6366f1 0%, transparent 70%)",
              }}
            />
            <div
              className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full blur-[100px] opacity-[0.10]"
              style={{
                background:
                  "radial-gradient(circle, #06d6a0 0%, transparent 70%)",
              }}
            />
          </div>

          <AppProvider>{children}</AppProvider>
        </div>
      </body>
    </html>
  );
}
