const plugin = require('tailwindcss/plugin');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    screens: {
      "2xl": { max: "1535px" },
      // => @media (max-width: 1535px) { ... }

      xl: { max: "1279px" },
      // => @media (max-width: 1279px) { ... }

      lg: { max: "1023px" },
      // => @media (max-width: 1023px) { ... }

      md: { max: "767px" },
      // => @media (max-width: 767px) { ... }

      sm: { max: "639px" },
      // => @media (max-width: 639px) { ... }

      xs: { max: "424px" },
      // => @media (max-width: 639px) { ... }

      xxs: {max: "374px"}
    },
    extend: {
      boxShadow: {
        'strong': '0 0 10px 5px rgba(0, 0, 0, 0.2)',
        'light': '0 0 4px 2px rgba(0,0,0,0.2)',
        'lightShadow-light': '0 0 4px 2px rgba(255, 255, 255, 0.2)',
        'lightShadow': '0 0 5px 5px rgba(255, 255, 255, 0.2)',
        'primary': '0 0 12px 6px rgba(154,107,241,0.5)'
      },
      colors: {
        dark1: "#060019", //zinc950 09090B
        dark2: "#15131b", //900 #18181b  
        dark3: "#27272A", //800
        dark4: "#3F3F46", //700
        dark5: "#52525B", //600
        dark6: "#71717A", //500
        dark7: "#A1A1AA",
        dark11: "#FFFFFF",

        
        light1: "#FFFFFF", //white
        light2: "#E4E4E7",
        light3: "#D4D4D8",
        light4: "#A1A1AA", //zinc400
        light5: "#71717A",
        light10: "#000000",

        altlight1: "#f8fafc", //slate50
        altlight2: "#f1f5f9", //slate100
        altlight3: "#e2e8f0", 
        altlight4: "#cbd5e1", //300
        altlight5: "#94a3b8",
        altlight6: "#64748b",
        altlight7: "#334155",
        altlight10: "#020617",


        darkText1: "#DCEBF5", //mint
        darkText2: "#d4d4d8", //zinc300
        darkText3: "rgba(255, 255, 255, .4)",

        lightText1: "#000000", //black
        lightText2: "#3F3F46", //zinc700

        darkBorder1: "#A1A1AA",
        lightBorder1: "#09090B",

        primaryo: "#f5823b",
        primaryp: "#9a6bf1",
        primaryb: "#15a4ff",
        primary1: "#4b22b3",
        primary2: "#9770fa",
        primary3: "#251157",
        primaryText1: "#FFFFFF",
        primaryText2: "rgba(255,255,255, .6)",
        primaryText3: "#4b22b3"
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    plugin(function ({ addVariant }) {
      addVariant('firefox', '@-moz-document url-prefix()');
    }),
  ],
}