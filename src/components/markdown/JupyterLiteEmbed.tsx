import * as React from "react";

const JUPYTERLITE_URL = 'myjupyterlite-git-jupyterlite-kamilrybacki.vercel.app';

interface JupyterLiteEmbedProps {
  size: string;
  file: string;
  kernel: string;
}

const supportedUnits: {
  [key: string]: (value: number) => number;
} = {
  px: (value: number) => value,
  cm: (value: number) => value * 38,
  mm: (value: number) => value * 3.8,
  q: (value: number) => value * 0.95,
  in: (value: number) => value * 96,
  pc: (value: number) => value * 16,
  pt: (value: number) => value * 1.333333,
  rem: (value: number) => value * parseFloat(getComputedStyle(document.documentElement).fontSize),
  em: (value: number) => value * parseFloat(getComputedStyle(document.body).fontSize),
  vw: (value: number) => (value / 100) * window.innerWidth,
  vh: (value: number) => (value / 100) * window.innerHeight,
  ms: (value: number) => value,
  s: (value: number) => value * 1000,
  deg: (value: number) => value,
  rad: (value: number) => value * (180 / Math.PI),
  grad: (value: number) => value * (180 / 200),
  turn: (value: number) => value * 360,
};

const convertCssUnit = function (cssvalue: string) {
  const allUnits = Object.keys(supportedUnits).join("|");
  const pattern = new RegExp(`^([0-9]+(?:\\.[0-9]+)?)(${allUnits})$`, "i");
  const matches = String.prototype.toString.apply(cssvalue).trim().match(pattern);

  if (matches) {
    const value = Number(matches[1]);
    const unit = matches[2].toLocaleLowerCase();
    if (unit in supportedUnits) {
      return supportedUnits[unit](value);
    }
  }
  return cssvalue;
};

const JupyterLiteEmbed = ({ size, file, kernel }: JupyterLiteEmbedProps) => {
  const jupyterIFrameRef = React.useRef<HTMLIFrameElement>(null);

  React.useEffect(() => {
    if (jupyterIFrameRef.current) {
      jupyterIFrameRef.current.style.height = convertCssUnit(size) + "px";
    }
  }, []);

  return (
    <iframe
      src={`https://${JUPYTERLITE_URL}/retro/notebooks/?path=${file}&kernel=${kernel}`}
      width="100%"
      ref={jupyterIFrameRef}
    />
  );
};

export default JupyterLiteEmbed;