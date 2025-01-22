/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#CE93D8",
        secondary: "#8E24AA",
        background: "#F3E5F5",
        plannedLeave: "#0000FF", // Blue
        sickLeave: "#FF0000", // Red
        workFromOffice: "#008000", // Green
      },
    },
  },
  
  plugins: [],
};

