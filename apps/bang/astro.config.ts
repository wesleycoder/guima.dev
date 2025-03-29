import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'
import { fileURLToPath } from 'node:url'
import type { PluginOption } from 'vite'

export default defineConfig({
  vite: {
    server: {
      fs: {
        allow: ['../..'],
      },
    },
    resolve: {
      alias: [
        {
          find: '@pkgs/',
          replacement: fileURLToPath(new URL('../../pkgs', import.meta.url)),
        },
      ],
    },
    plugins: [tailwindcss() as PluginOption],
  },
})
