import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@/services': path.resolve(__dirname, './src/services'),
      '@services': path.resolve(__dirname, './src/services'),
      '@': path.resolve(__dirname, './src/renderer'),
      '@shared': path.resolve(__dirname, './src/shared'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  base: './',
});
