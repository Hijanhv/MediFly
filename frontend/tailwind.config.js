/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "medical-blue": "#0066cc",
        "medical-red": "#dc2626",
        "medical-light": "#f0f9ff",
      },
      backgroundImage: {
        "sky-gradient": "linear-gradient(to bottom, #87CEEB, #98D8E8, #B0E0E6)",
        "cloud-sky":
          "linear-gradient(to bottom, #87CEEB 0%, #98D8E8 50%, #B0E0E6 100%)",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        drift: "drift 20s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        drift: {
          "0%": { transform: "translateX(0px)" },
          "100%": { transform: "translateX(100px)" },
        },
      },
    },
  },
  plugins: [],
};
