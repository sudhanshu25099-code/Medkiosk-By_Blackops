/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Medical Blue — trust, healthcare
        'medical-blue': '#1F5A8C',
        'medical-blue-dark': '#1A4A7A',
        'medical-blue-darker': '#163D66',

        // Clinical Gray — professional text
        'clinical-gray': '#2C3E50',
        'clinical-gray-light': '#34495E',

        // Status
        'success-green': '#27AE60',
        'success-green-light': '#D5F5E3',
        'warning-red': '#E74C3C',
        'warning-red-light': '#FADBD8',
        'warning-red-border': '#C0392B',

        // Neutral
        'neutral-gray': '#95A5A6',
        'bg-light': '#ECF0F1',

        // Triage colors
        'triage-routine-bg': '#D5F5E3',
        'triage-routine-text': '#1E8449',
        'triage-urgent-bg': '#FDEBD0',
        'triage-urgent-text': '#9C640C',
        'triage-emergency-bg': '#FADBD8',
        'triage-emergency-text': '#922B21',
      },
      fontFamily: {
        sans: [
          '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto',
          'Oxygen', 'Ubuntu', 'Cantarell', 'Helvetica Neue', 'sans-serif'
        ],
      },
      fontSize: {
        'xs': ['12px', { lineHeight: '1.5' }],
        'sm': ['14px', { lineHeight: '1.5' }],
        'base': ['16px', { lineHeight: '1.6' }],
        'lg': ['18px', { lineHeight: '1.4' }],
        'xl': ['24px', { lineHeight: '1.3' }],
        '2xl': ['32px', { lineHeight: '1.2' }],
      },
      spacing: {
        '18': '4.5rem',
        '30': '7.5rem',
      },
      minHeight: {
        'touch': '48px',
        'cta': '56px',
      },
      borderRadius: {
        'sm': '4px',
        'md': '6px',
        'lg': '8px',
      },
      transitionDuration: {
        '50': '50ms',
        '100': '100ms',
        '150': '150ms',
      },
      keyframes: {
        micPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'mic-pulse': 'micPulse 1.2s ease-in-out infinite',
        'fade-in': 'fadeIn 150ms ease-in-out',
        'slide-up': 'slideUp 200ms ease-out',
      },
    },
  },
  plugins: [],
};
