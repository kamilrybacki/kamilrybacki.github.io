export const generateNumberFromRange = (min: number, max: number) => {
  const range = max - min;
  return Math.floor(Math.random() * range) + min;
};

export const bamboozle = (input: string, shift: number): void => {
  const symbols: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result: string = "";
  if (shift > 26) {
    shift %= 26;
  }
  let i: number = 0;
  while (i < input.length) {
    if (symbols.indexOf(input[i].toLocaleUpperCase()) !== -1) {
      const j: number = symbols.indexOf(input[i].toUpperCase());
      if (symbols[j + shift]) {
        result += symbols[j + shift];
      } else {
        result += symbols[j + shift - 26];
      }
    } else {
      result += input[i].toLocaleUpperCase();
    }
    i++;
  }
  setTimeout(() => console.log(`[scrt] ${result}`), Math.floor(Math.random() * (5000 - 1000)) + 1000);
};
