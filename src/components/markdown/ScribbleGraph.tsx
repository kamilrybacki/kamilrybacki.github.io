import roughViz from "rough-viz";
import * as React from "react";

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
  title: string;
  options: {
    [key: string]: any;
  };
}

const ScribbleGraph: React.FC<ScribbleGraphProps> = (props) => {
  const [graph, setGraph] = React.useState<PossibleGraphType>(null);
  const { type, data, title, options } = props;
  const graphContainerId = `graph-${title.replace(/\s/g, '').toLowerCase()}`;

  React.useEffect(() => {
    setGraph(
      new graphTypeMap[type]({
        element: `#${graphContainerId}`,
        data: data,
        ...options,
        title: title,
      })
    );
  }, []);

  return (
    <>
      {
        graph ?
          <div id={graphContainerId}></div> :
          null
      }
    </>
  );
};

export default ScribbleGraph;
