import * as React from "react";
import roughViz from "rough-viz";
import { theme } from "@root/tailwind.config.js";
import invert from 'invert-color';

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
  width: number;
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
        colors: rest.colors ? 
          rest.colors.map((color: string) => invert(color))
          : [],
        titleFontSize: '1.5rem',
        margin: { top: 0, right: 0, bottom: 25, left: 25 },
      });
      setGraph(newGraph);
      if (!window.localStorage.getItem("lastGraphId")) {
        window.localStorage.setItem("lastGraphId", "1");
      } else {
        setGraphCounter(
          parseInt(
            window.localStorage.getItem("lastGraphId") || "1",
          ) + 1
        );

      };
    }
  }, [data, options]);

  return (
    <section className="flex flex-col justify-center my-4">
      <span className="mx-auto text-3xl font-bold font-handwriting mb-2" >{title}</span>
      <main 
        className="w-fit mx-auto"
        style={{ 
          display: 'grid',
          gridTemplateAreas: `'yLabel graph' 'blank xLabel'`,
          gridTemplateColumns: 'auto auto',
          gridTemplateRows: 'auto auto',
        }}
      >
        {
          yLabel &&
          <span 
            className="my-auto font-handwriting text-xl -rotate-90"
            style={{
              gridArea: 'yLabel',
            }}
          >
            {yLabel}
          </span>
        }
        <div 
          ref={graphRef}
          id={graphContainerId}
          className="mx-auto my-4 invert text-background"
          style={{ 
            width: width,
            height: height,
            gridArea: 'graph',
          }}
        />
        {
          xLabel &&
          <span 
            className="mx-auto font-bold text-xl font-handwriting mb-3 -mt-2"
            style={{
              gridArea: 'xLabel',
            }}
          >
            {xLabel}
          </span>
        }
      </main>
      <p className="mx-auto w-fit text-sm flex gap-1">
        <span className="font-bold my-auto text-base">
          Figure {graphCounter}:
        </span>
        <span className="my-auto">
          {caption.endsWith(".") ? caption.slice(0,caption.length - 1) : caption}
        </span>
      </p> 
    </section>
  );
};

export default ScribbleGraph;
