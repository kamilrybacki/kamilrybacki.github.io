// eslint-disable-next-line no-unused-vars
const React = require('react');
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

const isReactMetaTag = ({props}) => {
  return props && ('data-react-helmet' in props || 'content' in props);
};

exports.onPreRenderHTML = ({getHeadComponents, replaceHeadComponents}) => {
  const headComponents = getHeadComponents();
  const orderedHeadComponents = headComponents.sort((x, y) => {
    if (isReactMetaTag(x)) return -1;
    if (isReactMetaTag(y)) return 1;
    return 0;
  });
  replaceHeadComponents(orderedHeadComponents);
};
