import { theme } from "@root/tailwind.config.js";
import invert from "invert-color";
import * as React from "react";
// @ts-ignore
import roughViz from "rough-viz";

type PossibleGraphType =
  | roughViz.Bar
  | roughViz.BarH
  | roughViz.Donut
  | roughViz.Line
  | roughViz.Pie
  | roughViz.Scatter
  | roughViz.StackedBar;

const graphTypeMap: {
  [key: string]: () => PossibleGraphType;
} = {
  bar: roughViz.Bar,
  barH: roughViz.BarH,
  donut: roughViz.Donut,
  line: roughViz.Line,
  pie: roughViz.Pie,
  scatter: roughViz.Scatter,
  stackedBar: roughViz.StackedBar,
};

interface ScribbleGraphProps {
  type: string;
  data:
    | {
        [key: string]: any[];
      }
    | string;
  height: number;
  width?: number;
  title: string;
  caption: string;
  options: {
    [key: string]: any;
  };
}

const ScribbleGraph: React.FC<ScribbleGraphProps> = ({
  type,
  data,
  height,
  width,
  title,
  caption,
  options,
}: ScribbleGraphProps) => {
  const [graph, setGraph] = React.useState<PossibleGraphType | null>(null);
  const [graphCounter, setGraphCounter] = React.useState<number>(1);
  const graphRef = React.useRef<HTMLDivElement>(null);
  const graphContainerId = `graph-${title.replace(/\s/g, "").toLowerCase()}`;
  const { color, stroke, xLabel, yLabel, ...rest } = options;

  React.useEffect(() => {
    if (!graph) {
      if (color || stroke) {
        console.warn(
          `You should not specify color or stroke in the options for ${title} because they are set by the theme.`,
        );
      }
      const graphPrototype = graphTypeMap[type];
      // @ts-ignore
      const newGraph = new graphPrototype({
        element: `#${graphContainerId}`,
        data: data,
        ...rest,
        stroke: invert(theme.colors.glow),
        color: invert(theme.colors.glow),
        colors: rest.colors ? rest.colors.map((currentColor: string) => invert(currentColor)) : [],
        titleFontSize: "1.5rem",
        margin: { top: 0, right: 0, bottom: 25, left: 25 },
      });
      setGraph(newGraph);
      if (!window.localStorage.getItem("lastGraphId")) {
        window.localStorage.setItem("lastGraphId", "1");
      } else {
        setGraphCounter(parseInt(window.localStorage.getItem("lastGraphId") || "1") + 1);
      }
    }
  }, [data, options]);

  return (
    <section className="my-4 flex flex-col justify-center">
      <span className="mx-auto mb-2 font-handwriting text-3xl font-bold">{title}</span>
      <main
        className="mx-auto w-fit"
        style={{
          display: "grid",
          gridTemplateAreas: `"yLabel graph" "blank xLabel"`,
          gridTemplateColumns: "auto auto",
          gridTemplateRows: "auto auto",
        }}
      >
        {yLabel && (
          <span
            className="my-auto -rotate-90 font-handwriting text-xl"
            style={{
              gridArea: "yLabel",
            }}
          >
            {yLabel}
          </span>
        )}
        <div
          ref={graphRef}
          id={graphContainerId}
          className="mx-auto my-4 text-background invert"
          style={{
            gridArea: "graph",
            width: width ?? "100vw",
            height: height,
          }}
        />
        {xLabel && (
          <span
            className="mx-auto -mt-2 mb-3 font-handwriting text-xl font-bold"
            style={{
              gridArea: "xLabel",
            }}
          >
            {xLabel}
          </span>
        )}
      </main>
      <p className="mx-auto flex w-fit gap-1 text-sm">
        <span className="my-auto text-base font-bold">Figure {graphCounter}:</span>
        <span className="my-auto">{caption.endsWith(".") ? caption.slice(0, caption.length - 1) : caption}</span>
      </p>
    </section>
  );
};

export default ScribbleGraph;
