import { parseColor } from "tailwindcss/lib/util/color";

export const toRGB = (value: string) => parseColor(value).color.join(" ");
