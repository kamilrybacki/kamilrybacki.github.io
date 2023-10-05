import * as React from "react";
import roughViz from "rough-viz";
import { theme } from "@root/tailwind.config.js";

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
  options,
}: ScribbleGraphProps) => {
  const [graph, setGraph] = React.useState<PossibleGraphType | null>(null);
  const graphRef = React.useRef<HTMLDivElement>(null);
  const graphContainerId = `graph-${title.replace(/\s/g, "").toLowerCase()}`;

  React.useEffect(() => {
    const { color, stroke, ...rest } = options;
    if (color || stroke) {
      console.warn(
        `You should not specify color or stroke in the options for ${title} because they are set by the theme.`,
      );
    }
    // @ts-ignore
    const newGraph = new graphTypeMap[type]({
      element: `#${graphContainerId}`,
      data: data,
      ...rest,
      stroke: theme.colors.glow,
      color: theme.colors.glow,
    });
    setGraph(newGraph);
  }, [data, options]);

  React.useEffect(() => {
    if (graph) {
      const renderedGraph = graphRef.current?.querySelector("svg")?.firstChild as SVGSVGElement;
      console.log(renderedGraph)
    }
  }, [graph]);

  return (
    <section className="flex flex-col justify-center text-glow">
      <span className="mx-auto font-handwriting text-3xl font-bold">{title}</span>
      <div ref={graphRef} id={graphContainerId} className="mx-auto my-4" style={{ width: width, height: height }} />
    </section>
  );
};

export default ScribbleGraph;
