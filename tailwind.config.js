/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors from Colors.ts
        'navy': '#22303C',     // Deep Navy (background)
        'teal': '#3E6E68',     // Forest Teal (accent)
        'glacier': '#E6EFF4',  // Glacier (for light text)
        'dust': '#A0A8A3',     // Dust (muted text)
        
        // UI state colors
        'success': '#4ade80',
        'error': '#ef4444',
        'warning': '#f59e0b',
        'info': '#3b82f6',
      },
    },
  },
  plugins: [],
}

