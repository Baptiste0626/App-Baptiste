import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuration Vite minimale : plugin React (JSX + Fast Refresh)
export default defineConfig({
  plugins: [react()],
});
