import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'lions-blue': '#00338D',
        'lions-gold': '#EBB700',
        'lions-purple': '#7A2582',
      },
    },
  },
  plugins: [],
};

export default config;
