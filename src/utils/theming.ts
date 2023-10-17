import { theme } from "@root/tailwind.config.js";

export const glowAnimationName = "neon-accent";
export const glowAnimationMinimumIntensity = 50;
export const glowAnimationMaximumIntensity = 25;
export const glowAnimationMinimumDuration = 1000; // miliseconds
export const glowAnimationMaximumDuration = 2500; // miliseconds
export const glowAnimationMinimumOpacity = 75;
export const glowAnimationMaximumOpacity = 100;
export const glowAnimationMinimumSize = 10; // rems * 100
export const glowAnimationMaximumSize = 30; // rems * 100

export const parseColor = (value: string) => {
    const hex = value.replace("#", "");
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { color: [r, g, b], hex };
}

export const hexToRGB = (value: string): string => parseColor(value).color.join(" ");

export const colorsRGB: {
  [key: string]: string
} = Object.fromEntries(Object.entries(theme.colors).map(([key, value]) => [key, hexToRGB(value)]));

export const colorMixer = (rgbA: number[], rgbB: number[], amountToMix: number): string => {
    return rgbA
        .map((channelA, index) => {
            const channelB = rgbB[index];
            return parseInt(`${channelA * (amountToMix / 100) + channelB * (1 - amountToMix / 100)}`);
        })
        .reduce((acc, colorChannel) => `${acc}${acc === "rgb(" ? "" : ","}${colorChannel}`, "rgb(")
        .concat(")");
};
