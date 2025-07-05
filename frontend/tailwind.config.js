module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f9f9f9',
        primary: '#3b82f6',
        primaryDark: '#2563eb',
        accent: '#fbbf24',
        textgray: '#4b5563',
        card: '#ffffff',
        border: '#e5e7eb',
        muted: '#f3f4f6',
        error: '#ef4444',
        success: '#22c55e',
      },
      fontFamily: {
        sans: ['Inter', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 24px 0 rgba(59, 130, 246, 0.08)',
      },
    },
  },
  plugins: [],
};
