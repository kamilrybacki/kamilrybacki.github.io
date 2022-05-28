const {Helmet} = require('react-helmet');

exports.onRenderBody = (
    {setHeadComponents, setHtmlAttributes, setBodyAttributes,
      getHeadComponents},
) => {
  const helmet = Helmet.renderStatic();
  const headComponents = getHeadComponents();
  const orderedHeadComponents = headComponents.sort((a, b) => {
    if (a.type === 'meta') return -1;
    if (a.type === b.type && a.type === 'meta') return 0;
    return 1;
  });
  setHtmlAttributes(helmet.htmlAttributes.toComponent());
  setHeadComponents(orderedHeadComponents);
  setBodyAttributes(helmet.bodyAttributes.toComponent());
};
