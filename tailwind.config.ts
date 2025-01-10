// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      backgroundImage: {
        'grid-pattern': "url('/images/download.svg')",
        'gradient-light': 'radial-gradient(circle at top left, rgba(255, 255, 255, 0.3), transparent 70%)',
        'gradient-dark': 'linear-gradient(45deg, rgba(0, 0, 0, 0.5), transparent)',
      },
      backgroundSize: {
        'auto': 'auto',
        'cover': 'cover',
        'contain': 'contain',
        '50%': '50%',
        '16': '4rem',
      },
      colors: {
        background: {
          light: '#ffffff',
          dark: '#0a0a0a',
        },
        foreground: {
          light: '#171717',
          dark: '#ededed',
        },
      },
    },
  },
  darkMode: 'media', // Active le mode sombre basé sur les préférences du système
};
