import { loadEnv } from 'vite';

const env = loadEnv('development', process.cwd(), '');
console.log('VITE_API_BASE_URL:', env.VITE_API_BASE_URL);
