import type { Config } from "tailwindcss"
import type { PluginAPI } from 'tailwindcss/types/config'
import defaultTheme from "tailwindcss/defaultTheme"

const config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
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
  				gradient: {
  					from: 'hsl(var(--primary-gradient-from))',
  					to: 'hsl(var(--primary-gradient-to))',
  				},
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))',
  				gradient: {
  					from: 'hsl(var(--secondary-gradient-from))',
  					to: 'hsl(var(--secondary-gradient-to))',
  				},
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))',
  				gradient: {
  					from: 'hsl(var(--destructive-gradient-from))',
  					to: 'hsl(var(--destructive-gradient-to))',
  				},
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))',
  				gradient: {
  					from: 'hsl(var(--accent-gradient-from))',
  					to: 'hsl(var(--accent-gradient-to))',
  				},
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		fontFamily: {
  			sans: ['var(--font-sans)', ...defaultTheme.fontFamily.sans],
  			title: ['var(--font-cg)', ...defaultTheme.fontFamily.sans],
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
  	}
  },
  plugins: [
    require("tailwindcss-animate"),
    function({ addUtilities }: PluginAPI) {
      addUtilities({
        '.bg-gradient-primary': {
          background: `linear-gradient(135deg, var(--tw-gradient-from) 0%, var(--tw-gradient-to) 100%)`,
        },
        '.bg-gradient-secondary': {
          background: `linear-gradient(135deg, var(--tw-gradient-from) 0%, var(--tw-gradient-to) 100%)`,
        },
        '.bg-gradient-destructive': {
          background: `linear-gradient(135deg, var(--tw-gradient-from) 0%, var(--tw-gradient-to) 100%)`,
        },
        '.bg-gradient-accent': {
          background: `linear-gradient(135deg, var(--tw-gradient-from) 0%, var(--tw-gradient-to) 100%)`,
        },
      })
    }
  ],
} satisfies Config

export default config 