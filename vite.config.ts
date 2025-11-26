import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Cast process to any to handle TypeScript error: Property 'cwd' does not exist on type 'Process'
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Use logical OR to ensure it is never undefined, preventing JSON.stringify crashes
      'process.env.API_KEY': JSON.stringify(env.API_KEY || '')
    }
  };
});
