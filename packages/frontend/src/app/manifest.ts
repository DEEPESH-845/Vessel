import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Vessel - Gasless Crypto Payments',
    short_name: 'Vessel',
    description: 'The gasless payment layer for the stablecoin economy. Zero gas. One tap. Instant.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0A0A0A',
    theme_color: '#CCFF00',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['finance', 'utilities'],
    orientation: 'portrait',
    scope: '/',
    lang: 'en',
  }
}
