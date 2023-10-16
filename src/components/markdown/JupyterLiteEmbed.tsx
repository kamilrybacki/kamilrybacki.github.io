/* eslint-disable tailwindcss/no-custom-classname */
import { theme } from "@root/tailwind.config";
import * as React from "react";
import { ClockLoader } from "react-spinners";

const JUPYTERLITE_URL = "myjupyterlite-git-jupyterlite-kamilrybacki.vercel.app";

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
  return 0;
};

const loadingTimeout = 5000;
const targetLoaderSize = "7.5rem";
const loaderColor = theme.colors.glow;

const JupyterLiteEmbed = ({ size, file, kernel }: JupyterLiteEmbedProps) => {
  const [startNotebook, setStartNotebook] = React.useState(false);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [loaderSize, setLoaderSize] = React.useState(0);
  const [loadingText, setLoadingText] = React.useState(["Loading notebook"]);
  const [loadingSpeed, setLoadingSpeed] = React.useState(0.5);
  const loadingSpinnerRef = React.useRef<HTMLDivElement>(null);
  const iframeWrapperRef = React.useRef<HTMLDivElement>(null);
  const jupyterIFrameRef = React.useRef<HTMLIFrameElement>(null);

  React.useEffect(() => {
    loadingSpinnerRef.current!.style.width = `${iframeWrapperRef.current!.clientWidth}px`;
    loadingSpinnerRef.current!.style.paddingTop = convertCssUnit(size) / 4 + "px";
  }, []);

  React.useEffect(() => {
    if (startNotebook) {
      iframeWrapperRef.current!.style.height = convertCssUnit(size) + "px";
      loadingSpinnerRef.current!.style.height = convertCssUnit(size) + "px";
      jupyterIFrameRef.current!.style.height = convertCssUnit(size) + "px";
      window.addEventListener("message", ({ data }) => {
        if (data.notebookContentLoaded && !isLoaded) {
          setIsLoaded(true);
        }
      });
      loadingSpinnerRef.current!.classList.replace("hidden", "flex");
      loadingSpinnerRef.current!.classList.add("flex-col");
      if (!isLoaded) {
        const calculatedLoaderSize = convertCssUnit(targetLoaderSize);
        setLoaderSize(calculatedLoaderSize);
        setTimeout(() => {
          setLoadingText(["Still loading notebook..."]);
          setLoadingSpeed(0.25);
          setTimeout(() => {
            setLoadingText(["Still loading notebook...", "(maybe come back here in a while)"]);
            setLoadingSpeed(0.1);
          }, loadingTimeout);
        }, loadingTimeout);
      }
    }
  }, [startNotebook]);

  React.useEffect(() => {
    if (startNotebook) {
      const elementToFadeOut = isLoaded ? loadingSpinnerRef.current : jupyterIFrameRef.current;
      const elementToFadeIn = isLoaded ? jupyterIFrameRef.current : loadingSpinnerRef.current;
      elementToFadeOut!.style.opacity = "0";
      elementToFadeIn!.style.opacity = "1";
    }
  }, [isLoaded]);

  return (
    <div className="relative my-6 w-full">
      <div className="notebook-spacer mx-auto mb-4 w-1/2 border-[1px] border-dashed opacity-25" />
      <div className="pointer-events-none absolute z-10 m-auto hidden" ref={loadingSpinnerRef}>
        {loadingText.map((text, index) => (
          <span key={index} className="mx-auto mb-1 text-center font-body text-base lg:text-3xl">
            {text}
          </span>
        ))}
        <span className="mx-auto my-2 font-body text-2xl font-bold lg:mb-6 lg:text-4xl">{file.split("/").pop()}</span>
        <ClockLoader
          speedMultiplier={loadingSpeed}
          color={loaderColor}
          size={loaderSize}
          className="mx-auto scale-75 border-2 lg:scale-100"
        />
      </div>
      <div className="flex items-center justify-center" ref={iframeWrapperRef}>
        {startNotebook ? (
          <React.Fragment>
            <span className="absolute left-2 top-4 text-xs opacity-25 hover:opacity-50">
              Powered by{" "}
              <a className="font-bold underline" href="https://github.com/jupyterlite/jupyterlite">
                JupyterLite
              </a>
            </span>
            <iframe
              src={`https://${JUPYTERLITE_URL}/retro/notebooks/?path=${file}&kernel=${kernel}`}
              width="100%"
              ref={jupyterIFrameRef}
            />
          </React.Fragment>
        ) : (
          <button
            className="px-2 py-1 font-handwriting text-xl font-bold lg:px-4 lg:py-2 lg:text-3xl"
            onClick={() => {
              document
                .querySelectorAll(".notebook-spacer")
                .forEach((spacer) => spacer.classList.replace("w-1/2", "w-full"));
              setStartNotebook(!startNotebook);
            }}
          >
            Load {file.split("/").pop()}
          </button>
        )}
      </div>
      <div className="notebook-spacer mx-auto mt-4 w-1/2 border-[1px] border-dashed opacity-25" />
    </div>
  );
};

export default JupyterLiteEmbed;
