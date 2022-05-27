import './src/style/global.css';

export const onPreRenderHTML = ({getHeadComponents, replaceHeadComponents}) => {
  /**
     * @type {any[]} headComponents
     */
  const headComponents = getHeadComponents();

  headComponents.sort((a) => (a.props && a.props['my-seo']) ? 0 : -1);
  replaceHeadComponents(headComponents);
};
