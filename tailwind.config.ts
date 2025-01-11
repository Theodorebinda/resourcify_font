
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
  	container: {
  		center: true,
  		padding: '3rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		backgroundImage: {
  			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
  			'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
  		},
  		colors: {
  			ligthThem: {
  				body: '#fff',
  				text: '#8f8e8e',
  				Default: '#39ae44'
  			},
  			darkTheme: {
  				body: '#222020',
  				text: '#8f8e8e',
  				titre: '#000'
  			},
  			destructive: '#ff0035',
  			accent: '#f68e5f',
  			white: '#ffffff',
  			black: '#000f08',
  			gray: {
  				'50': '#f3f5f0',
  				'100': '#e6e8df',
  				'200': '#cfd3c3',
  				'400': '#939d7e',
  				'500': '#778161',
  				'600': '#5c664a',
  				'700': '#494f3c',
  				'800': '#3c4133',
  				'900': '#35392e',
  				'950': '#1b1d16',
  				Default: '#a9b195'
  			},
  			white_powder: '#fafaf2'
  		},
  	
			borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		},
				fontFamily: {
					sans: ['Poppins', 'sans-serif'], // Configurez Poppins comme police principale
					poppins: ['Poppins', 'sans-serif'], // Ajoutez une option dédiée si nécessaire
			},
  	}
  },
  plugins: [
    // require("tailwindcss-animate"),
  ],
}
export default config
