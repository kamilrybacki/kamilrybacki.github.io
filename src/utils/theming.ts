import { theme } from '@root/tailwind.config.js'
import { parseColor } from "tailwindcss/lib/util/color";
import { generateNumberFromRange } from '@utils/logic';

export const glowAnimationName = 'neon-glow';
export const glowAnimationMinimumIntensity = 50;
export const glowAnimationMaximumIntensity = 25;
export const glowAnimationMinimumDuration = 1000; // miliseconds
export const glowAnimationMaximumDuration =2500; // miliseconds
export const glowAnimationMinimumOpacity = 75;
export const glowAnimationMaximumOpacity = 100;
export const glowAnimationMinimumSize = 10; // rems * 100
export const glowAnimationMaximumSize = 30; // rems * 100

export const toRGB = (value: string) => parseColor(value).color.join(" ");

export const colorsRGB = Object.fromEntries(
  Object.entries(theme.colors).map(([key, value]) => [key, toRGB(value)])
)

export const colorMixer = (rgbA: number[], rgbB: number[], amountToMix: number) => {
    return rgbA
      .map((channelA, index) => {
        const channelB = rgbB[index];
        return parseInt(
          `${channelA * (amountToMix / 100) + channelB * (1 - (amountToMix / 100))}`
        );
      })
      .reduce((acc, colorChannel) => `${acc}${acc === 'rgb(' ? '' : ','}${colorChannel}`,
      "rgb("
    ).concat(")");
};

export const createRandomNeonGlowKeyframesGenerator = () => {
  return () => {
      const glowIntensity = generateNumberFromRange(glowAnimationMinimumIntensity, glowAnimationMaximumIntensity); 
      const neonColor = colorMixer(
        parseColor(theme.colors.glow).color,
        parseColor(theme.colors.background).color,
        glowIntensity
      )
      const numberOfKeyframes = generateNumberFromRange(4,10);
      const randomDuration = generateNumberFromRange(glowAnimationMinimumDuration, glowAnimationMaximumDuration); 
      const randomKeyframesParameters = Array
        .from(
          { length: numberOfKeyframes },
          () => generateNumberFromRange(glowAnimationMinimumOpacity, glowAnimationMaximumOpacity)
        )
        .map((opacity) => {
            const size = generateNumberFromRange(glowAnimationMinimumSize, glowAnimationMaximumSize);
            return [opacity, size]
          }
        )
      return {
        properties: {
          duration: randomDuration,
          easing: 'linear',
          direction: 'alternate' as PlaybackDirection,
          iterations: 1
        },
        keyframes: randomKeyframesParameters.map(([opacity, size]) => {
          return {
            textShadow: `0px 0px ${size/100}rem ${neonColor}`,
            opacity: `${opacity/100}`
          }
        }),
        duration: randomDuration
      }
  }
};
