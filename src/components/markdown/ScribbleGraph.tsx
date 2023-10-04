import * as React from "react";
import roughViz from "rough-viz";
import { theme } from "@root/tailwind.config.js";

type PossibleGraphType = roughViz.Bar | roughViz.BarH | roughViz.Donut | roughViz.Line | roughViz.Pie | roughViz.Scatter | roughViz.StackedBar;

const graphTypeMap: {
  [key: string]: () => PossibleGraphType;
} = {
  'bar': roughViz.Bar,
  'barH': roughViz.BarH,
  'donut': roughViz.Donut,
  'line': roughViz.Line,
  'pie': roughViz.Pie,
  'scatter': roughViz.Scatter,
  'stackedBar': roughViz.StackedBar,
}

interface ScribbleGraphProps {
  type: string;
  data: {
    [key: string]: any[];
  } | string;
  height: number;
  width: number;
  title: string;
  options: {
    [key: string]: any;
  };
}

const ScribbleGraph: React.FC<ScribbleGraphProps> = ({ type, data, height, width, title, options }: ScribbleGraphProps) => {
  const graphContainerId = `graph-${title.replace(/\s/g, '').toLowerCase()}`;

  React.useEffect(() => {
    new graphTypeMap[type]({
      element: `#${graphContainerId}`,
      data: data,
      ...options,
      stroke: theme.colors.glow,
    })
  }, []);

  return (
    <section className="flex flex-col justify-center">
      <span className="mx-auto text-3xl font-bold font-handwriting">{title}</span>
      <div
        id={graphContainerId}
        className="mx-auto my-4"
        style={{
          width: width,
          height: height,
        }}
      />
    </section>
  );
};

export default ScribbleGraph;
