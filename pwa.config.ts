import { ManifestOptions, VitePWA } from 'vite-plugin-pwa'

export const base = '/'

const manifest: Partial<ManifestOptions> = {
    name: "Currency converter",
    short_name: "Currency",
    description: "Currency exchange application",
    theme_color: '#ffffff',
    icons: [
        {
            src: `${base}android-chrome-192x192.png`,
            sizes: "192x192",
            type: "image/png",
            purpose: 'maskable',
        },
        {
            src: `${base}android-chrome-512x512.png`,
            sizes: "512x512",
            type: "image/png"
        }
    ],
}

export const PWAConfig = () => VitePWA({
    registerType: 'autoUpdate',
    injectRegister: 'inline',
    manifest,
    strategies: 'generateSW',
    workbox: {
        runtimeCaching: [
            {
                urlPattern: 'https://cdn.jsdelivr.net/npm/@fawazahmed0/**/*',
                handler: 'NetworkFirst',
                options: {
                    cacheName: 'Currencies',
                    cacheableResponse: {
                        statuses: [200]
                    }
                }
            },
            {
                urlPattern: 'https://currency-app.pungy.me/**/*',
                handler: 'NetworkFirst',
                options: {
                    cacheName: 'Currencies',
                    cacheableResponse: {
                        statuses: [200]
                    }
                }
            }
        ]
    }
})
