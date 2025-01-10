// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      backgroundImage: {
        'grid-pattern': "url('/images/download.svg')",
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
