const settingsScreens = require("./tailwind.settings.screens");
const settingsFontSizes = require("./tailwind.settings.fontSizes");

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./contexts/**/*.{js,ts,jsx,tsx}",
    "./providers/**/*.{js,ts,jsx,tsx}",
    "./Components/**/*.{js,ts,jsx,tsx}",
  ],
  important: true,
  darkMode: "class", // or 'media' or 'class'
  screens: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    xxl: '1440px',
  },
  theme: {
    screens: settingsScreens,
    fontSize: settingsFontSizes,
    fontFamily: {
      sans: ["Inter", "ui-sans-serif", "system-ui"],
      serif: ["ui-serif", "Georgia"],
      mono: ["ui-monospace", "SFMono-Regular"],
      display: ["Oswald"],
      body: ['"Open Sans"'],
    },
    extend: {
      colors: {
        inherit: "inherit",
        transparent: "transparent",
        current: "currentColor",
        black: "#000000",
        white: "#FFFFFF",
        greyContainer: "#f0ffff6",
        navBG: "var(--navBG)",
        pageBG: "var(--pageBG)",
        pageText: "var(--pageText)",
      },
      borderWidth: {
        10: "2px",
        12: "2px",
      },
      animation: {
        marquee: "marquee 25s linear infinite",
        marquee2: "marquee2 25s linear infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        marquee2: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0%)" },
        },
        backgroundImage: {
          homepage: "url('../public/bg.png')",
          landingPage: "url('../public/images/Fapetown.png')",
          staking: "url('../public/Fape_Camp.png')",
          juicebar: "url('../public/Juice_Bar.png')",
          c25mint: "url('../public/C25.png')",
          about: "url('../public/Syndic.png')",
          market: "url('../public/Market.png')",
          arcade: "url('../public/R-Cade.png')",
          factory: "url('../public/Factory.png')",
          cyborgMint: "url('../public/Cyborg.png')",
          gallery: "url('../public/Gallery.png')",
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
  function ({ addComponents }) {
    addComponents({
      ".container": {
        maxWidth: "100%",
        "@screen sm": {
          maxWidth: "640px",
        },
        "@screen md": {
          maxWidth: "768px",
        },
        "@screen lg": {
          maxWidth: "1280px",
        },
        "@screen xl": {
          maxWidth: "1400px",
        },
      },
    });
  },
  ]
};
