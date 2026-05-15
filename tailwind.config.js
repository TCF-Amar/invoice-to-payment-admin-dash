/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#6366F1',
          dark: '#4F46E5',
        },
        surface: {
          DEFAULT: '#111318',
          elevated: '#181B22',
        },
        bg: '#0A0C10',
        status: {
          draft: '#475569',
          pending_approval: '#F59E0B',
          approved: '#3B82F6',
          rejected: '#F43F5E',
          open: '#8B5CF6',
          partial: '#F97316',
          delivered: '#14B8A6',
          closed: '#10B981',
          cancelled: '#71717A',
          received: '#0EA5E9',
          paid: '#10B981',
          failed: '#F43F5E',
          scheduled: '#F59E0B',
          processing: '#3B82F6',
          completed: '#10B981',
          refunded: '#8B5CF6',
          duplicate: '#F97316',
          validated: '#0EA5E9',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      backdropBlur: {
        md: '12px',
      },
      boxShadow: {
        glow: '0 0 20px rgba(99, 102, 241, 0.3)',
      },
    },
  },
}
