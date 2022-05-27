module.exports = onPreRenderHTML = ({getHeadComponents, replaceHeadComponents}) => {
  const headComponents = getHeadComponents();
  headComponents.sort((a, b) => {
    if (a.props && a.props['my-seo']) return -1;
    if (b.props && b.props['my-seo']) return 1;
    return 0;
  });

  replaceHeadComponents(headComponents);
};
