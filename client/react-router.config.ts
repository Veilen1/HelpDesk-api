import { defineConfig } from 'vitest/config'
import reactRouter from '@vercel/react-router/vite'

export default defineConfig({
  plugins: [reactRouter()],
  ssr: false,
})