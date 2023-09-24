import { theme } from "@root/tailwind.config.js";
// @ts-ignore
import pkg from "tailwindcss/lib/util/color.js"; // eslint-disable-line import/extensions
const { parseColor } = pkg;

export const glowAnimationName = "neon-accent";
export const glowAnimationMinimumIntensity = 50;
export const glowAnimationMaximumIntensity = 25;
export const glowAnimationMinimumDuration = 1000; // miliseconds
export const glowAnimationMaximumDuration = 2500; // miliseconds
export const glowAnimationMinimumOpacity = 75;
export const glowAnimationMaximumOpacity = 100;
export const glowAnimationMinimumSize = 10; // rems * 100
export const glowAnimationMaximumSize = 30; // rems * 100

export const toRGB = (value: string) => parseColor(value).color.join(" ");

export const colorsRGB = Object.fromEntries(Object.entries(theme.colors).map(([key, value]) => [key, toRGB(value)]));

export const colorMixer = (rgbA: number[], rgbB: number[], amountToMix: number) => {
    return rgbA
        .map((channelA, index) => {
            const channelB = rgbB[index];
            return parseInt(`${channelA * (amountToMix / 100) + channelB * (1 - amountToMix / 100)}`);
        })
        .reduce((acc, colorChannel) => `${acc}${acc === "rgb(" ? "" : ","}${colorChannel}`, "rgb(")
        .concat(")");
};
