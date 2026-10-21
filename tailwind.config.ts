// tailwind.config.ts
import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
import plugin from "tailwindcss/plugin";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
	darkMode: ["class"],
	content: [
	  './pages/**/*.{ts,tsx}',
	  './components/**/*.{ts,tsx}',
	  './app/**/*.{ts,tsx}',
	  './src/**/*.{ts,tsx}',
	],
	prefix: "",
	theme: {
	  // Breakpoints from the design: 640 (wider gutter), 760 (two columns), 960 (split-screen auth)
	  screens: {
		sm: "640px",
		md: "760px",
		lg: "960px",
		xl: "1280px",
	  },
	  container: {
		center: true,
		padding: "2rem",
		screens: {
		  "2xl": "1400px",
		},
	  },
	  extend: {
		// Sizes only: text inherits the 1.55 body line-height, as in the design
		fontSize: {
		  xs: "12px",
		  sm: "14px",
		  base: "16px",
		  lg: "18px",
		  xl: "20px",
		  "2xl": "24px",
		},
		fontFamily: {
		  sans: ["var(--font-geist-sans)", ...defaultTheme.fontFamily.sans],
		  display: ["var(--font-display)", "Georgia", ...defaultTheme.fontFamily.serif],
		},
		colors: {
		  border: "hsl(var(--border))",
		  input: "hsl(var(--input))",
		  ring: "hsl(var(--ring))",
		  background: "hsl(var(--background))",
		  foreground: "hsl(var(--foreground))",
		  primary: {
			DEFAULT: "hsl(var(--primary))",
			foreground: "hsl(var(--primary-foreground))",
		  },
		  secondary: {
			DEFAULT: "hsl(var(--secondary))",
			foreground: "hsl(var(--secondary-foreground))",
		  },
		  destructive: {
			DEFAULT: "hsl(var(--destructive))",
			foreground: "hsl(var(--destructive-foreground))",
		  },
		  muted: {
			DEFAULT: "hsl(var(--muted))",
			foreground: "hsl(var(--muted-foreground))",
		  },
		  accent: {
			DEFAULT: "hsl(var(--accent))",
			foreground: "hsl(var(--accent-foreground))",
		  },
		  popover: {
			DEFAULT: "hsl(var(--popover))",
			foreground: "hsl(var(--popover-foreground))",
		  },
		  card: {
			DEFAULT: "hsl(var(--card))",
			foreground: "hsl(var(--card-foreground))",
		  },
		  // Design tokens; full colour values, so no opacity modifiers
		  bg: "var(--bg)",
		  surface: {
			DEFAULT: "var(--surface)",
			2: "var(--surface-2)",
			3: "var(--surface-3)",
		  },
		  ink: {
			DEFAULT: "var(--ink)",
			2: "var(--ink-2)",
			3: "var(--ink-3)",
		  },
		  line: {
			DEFAULT: "var(--line)",
			strong: "var(--line-strong)",
		  },
		  pine: {
			DEFAULT: "var(--pine)",
			hover: "var(--pine-hover)",
			ink: "var(--pine-ink)",
			soft: "var(--pine-soft)",
			text: "var(--pine-text)",
		  },
		  gold: {
			soft: "var(--gold-soft)",
			text: "var(--gold-text)",
			line: "var(--gold-line)",
			// Bright gold on the pine hero and art panel, same in both themes
			bright: "#F1D58E",
		  },
		  berry: {
			DEFAULT: "var(--berry)",
			ink: "var(--berry-ink)",
			soft: "var(--berry-soft)",
			text: "var(--berry-text)",
		  },
		  hero: {
			1: "var(--hero-1)",
			2: "var(--hero-2)",
			ink: "var(--hero-ink)",
			"ink-2": "var(--hero-ink-2)",
		  },
		},
		borderRadius: {
		  lg: "var(--radius)",
		  md: "calc(var(--radius) - 4px)",
		  sm: "calc(var(--radius) - 8px)",
		  hero: "28px",
		  card: "20px",
		  input: "12px",
		},
		boxShadow: {
		  sm: "var(--shadow-sm)",
		  DEFAULT: "var(--shadow)",
		  lg: "var(--shadow-lg)",
		  ring: "var(--focus-ring)",
		},
		transitionTimingFunction: {
		  DEFAULT: "cubic-bezier(.2, .8, .2, 1)",
		  soft: "cubic-bezier(.2, .8, .2, 1)",
		},
		animation: {
		  rise: "rise .5s cubic-bezier(.2, .8, .2, 1) both",
		  "toast-in": "toast-in .35s cubic-bezier(.2, .8, .2, 1) both",
		},
	  },
	},
	plugins: [
	  tailwindcssAnimate,
	  plugin(({ addVariant, matchUtilities, theme }) => {
		// Hover effects only on devices that can hover, so taps don't leave cards lifted
		addVariant("hoverable", "@media (hover: hover) { &:hover }");
		// tone-0 … tone-5: avatar and tile tints (green, berry, gold, violet, blue, cocoa)
		matchUtilities(
		  {
			tone: (value: string) => ({
			  backgroundColor: `var(--t${value}-bg)`,
			  color: `var(--t${value}-fg)`,
			}),
		  },
		  { values: theme("tones") }
		);
	  }, {
		theme: { tones: { 0: "0", 1: "1", 2: "2", 3: "3", 4: "4", 5: "5" } },
	  }),
	],
} satisfies Config;
