import { defineConfig, splitVendorChunkPlugin } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { visualizer } from "rollup-plugin-visualizer";
import { PWAConfig } from './pwa.config.js'

const VISUALIZE_BUNDLE = false


const plugins = [
    tsconfigPaths(),
    react(),
    splitVendorChunkPlugin(),
    PWAConfig(),
]

if (VISUALIZE_BUNDLE) {
    plugins.push(visualizer())
}

// https://vitejs.dev/config/
export default defineConfig({
    base: '/currency-converter/',
    plugins,
})
