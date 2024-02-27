import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Montserrat", ...fontFamily.sans],
      },
    },
  },
  plugins: [],
} satisfies Config;
