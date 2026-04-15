import { defineConfig } from 'vite'

export default defineConfig({
  // Sirve la carpeta resource/ como raíz estática
  // resource/img/bg.jpeg → accesible en /img/bg.jpeg
  publicDir: 'resource',
  server: {
    port: 3000,
  },
})
