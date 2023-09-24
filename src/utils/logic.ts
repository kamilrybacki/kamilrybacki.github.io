export const generateNumberFromRange = (min: number, max: number) => {
    const range = max - min;
    return Math.floor(Math.random() * range) + min;
};
