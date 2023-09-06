import { theme } from '@root/tailwind.config.js'
import { parseColor } from "tailwindcss/lib/util/color";

export const toRGB = (value: string) => parseColor(value).color.join(" ");

export const colorsRGB = Object.fromEntries(
  Object.entries(theme.colors).map(([key, value]) => [key, toRGB(value)])
)
