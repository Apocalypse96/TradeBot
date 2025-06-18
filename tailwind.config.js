/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        gray: {
          850: "#1f2937",
          950: "#0f172a",
        },
        blue: {
          450: "#3b82f6",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "trading-gradient":
          "linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%)",
        "neon-gradient":
          "linear-gradient(45deg, #3b82f6, #8b5cf6, #06b6d4, #10b981)",
      },
      animation: {
        "gradient-x": "gradient-x 15s ease infinite",
        "gradient-y": "gradient-y 15s ease infinite",
        "gradient-xy": "gradient-xy 15s ease infinite",
        "neon-pulse": "neon-pulse 2s ease-in-out infinite alternate",
        "voice-recording": "voice-recording 1.5s ease-in-out infinite",
        "price-up": "price-up 0.6s ease-out",
        "price-down": "price-down 0.6s ease-out",
        "chart-pulse": "chart-pulse 3s ease-in-out infinite",
        "status-blink": "status-blink 2s ease-in-out infinite",
        "fade-in": "fade-in 0.6s ease-out forwards",
        "slide-up": "slide-up 0.5s ease-out forwards",
        float: "float 6s ease-in-out infinite",
        marquee: "marquee 30s linear infinite",
        "marquee-reverse": "marquee-reverse 30s linear infinite",
      },
      keyframes: {
        "gradient-y": {
          "0%, 100%": {
            transform: "translateY(-50%)",
          },
          "50%": {
            transform: "translateY(50%)",
          },
        },
        "gradient-x": {
          "0%, 100%": {
            transform: "translateX(-50%)",
          },
          "50%": {
            transform: "translateX(50%)",
          },
        },
        "gradient-xy": {
          "0%, 100%": {
            transform: "translate(-50%, -50%)",
          },
          "25%": {
            transform: "translate(50%, -50%)",
          },
          "50%": {
            transform: "translate(50%, 50%)",
          },
          "75%": {
            transform: "translate(-50%, 50%)",
          },
        },
        "neon-pulse": {
          from: { filter: "brightness(1)" },
          to: { filter: "brightness(1.2)" },
        },
        "voice-recording": {
          "0%, 100%": {
            transform: "scale(1)",
            boxShadow: "0 0 20px rgba(239, 68, 68, 0.5)",
          },
          "50%": {
            transform: "scale(1.05)",
            boxShadow: "0 0 30px rgba(239, 68, 68, 0.8)",
          },
        },
        "price-up": {
          "0%": { color: "#10b981", transform: "scale(1)" },
          "50%": { color: "#34d399", transform: "scale(1.1)" },
          "100%": { color: "#10b981", transform: "scale(1)" },
        },
        "price-down": {
          "0%": { color: "#ef4444", transform: "scale(1)" },
          "50%": { color: "#f87171", transform: "scale(1.1)" },
          "100%": { color: "#ef4444", transform: "scale(1)" },
        },
        "chart-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)",
          },
          "50%": {
            boxShadow: "0 0 40px rgba(59, 130, 246, 0.6)",
          },
        },
        "status-blink": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
        "fade-in": {
          from: {
            opacity: "0",
            transform: "translateY(20px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "slide-up": {
          from: {
            opacity: "0",
            transform: "translateY(30px) scale(0.95)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0) scale(1)",
          },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        "marquee-reverse": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0%)" },
        },
      },
      boxShadow: {
        "neon-blue":
          "0 0 20px rgba(59, 130, 246, 0.4), 0 0 40px rgba(59, 130, 246, 0.2), 0 0 60px rgba(59, 130, 246, 0.1)",
        "neon-green":
          "0 0 20px rgba(16, 185, 129, 0.4), 0 0 40px rgba(16, 185, 129, 0.2), 0 0 60px rgba(16, 185, 129, 0.1)",
        "neon-red":
          "0 0 20px rgba(239, 68, 68, 0.4), 0 0 40px rgba(239, 68, 68, 0.2), 0 0 60px rgba(239, 68, 68, 0.1)",
        glass:
          "0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        trading:
          "0 4px 20px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
