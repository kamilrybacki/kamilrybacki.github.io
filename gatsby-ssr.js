const {Helmet} = require('react-helmet');

exports.onRenderBody = (
    {setHeadComponents, setHtmlAttributes, setBodyAttributes},
) => {
  const helmet = Helmet.renderStatic();
  setHtmlAttributes(helmet.htmlAttributes.toComponent());
  setBodyAttributes(helmet.bodyAttributes.toComponent());
  setHeadComponents([
    helmet.title.toComponent(),
    helmet.link.toComponent(),
    helmet.meta.toComponent(),
    helmet.noscript.toComponent(),
    helmet.script.toComponent(),
    helmet.style.toComponent(),
  ]);
};

exports.onPreRenderHTML = ({getHeadComponents, replaceHeadComponents}) => {
  const headComponents = getHeadComponents();
  const orderedHeadComponents = headComponents.sort((a, b) => {
    if (x.key === 'seoMeta') return -1;
    if (y.key === 'seoMeta') return 1;
    return 0;
  });
  replaceHeadComponents(orderedHeadComponents);
};
