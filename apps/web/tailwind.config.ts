import preset from "@repo/config/tailwind/preset";
import type { Config } from "tailwindcss";


const config: Config = {
  presets: [preset],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}"
  ]
};

export default config;
