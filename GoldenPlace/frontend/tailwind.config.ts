import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        success: '#00a884',
        sale_badge: '#ff6b6b',
        navy: {
          DEFAULT: '#1a1f36',
          50: '#eef0f8',
          100: '#d5d9ef',
          200: '#aab2de',
          300: '#7f8bcd',
          400: '#5464bc',
          500: '#3a4aa5',
          600: '#2d3a84',
          700: '#242d66',
          800: '#1a1f36',
          900: '#10132a',
          950: '#080b18',
        },
        gold: {
          DEFAULT: '#c9a84c',
          50: '#fdf9ee',
          100: '#f8efcf',
          200: '#f1dc9a',
          300: '#e8c96d',
          400: '#ddb23f',
          500: '#c9a84c',
          600: '#b08a2e',
          700: '#8a6a22',
          800: '#6b5120',
          900: '#55421c',
          950: '#30240e',
        },
        surface: {
          DEFAULT: '#242840',
          card: '#242840',
          hover: '#2c3050',
          border: '#363c5e',
        },
        pearl: '#f5f0e8',
        secondary: '#a0a8c0',
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-up': 'fadeUp 0.5s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'shimmer': 'shimmer 2s infinite',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(201, 168, 76, 0.4)' },
          '50%': { boxShadow: '0 0 0 10px rgba(201, 168, 76, 0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, #c9a84c 0%, #e8c96d 50%, #c9a84c 100%)',
        'gradient-navy': 'linear-gradient(135deg, #1a1f36 0%, #242840 100%)',
        'glass': 'linear-gradient(135deg, rgba(36,40,64,0.8) 0%, rgba(26,31,54,0.9) 100%)',
      },
      boxShadow: {
        'gold': '0 0 20px rgba(201, 168, 76, 0.3)',
        'gold-lg': '0 0 40px rgba(201, 168, 76, 0.2)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'nav': '0 2px 20px rgba(0, 0, 0, 0.5)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

export default config
