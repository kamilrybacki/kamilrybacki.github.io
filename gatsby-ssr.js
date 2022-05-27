import './src/style/global.css';

export const onPreRenderHTML = ({getHeadComponents, replaceHeadComponents}) => {
  /**
     * @type {any[]} headComponents
     */
  const headComponents = getHeadComponents();

  headComponents.sort((a, b) => {
    if (a.props && a.props['data-react-helmet']) {
      return 0;
    }
    return 1;
  });
  replaceHeadComponents(headComponents);
};
