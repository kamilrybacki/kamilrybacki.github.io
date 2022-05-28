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

exports.onPreRenderHTML = ({getHeadComponents, replaceHeadComponents}) => {
  const headComponents = getHeadComponents();
  const orderedHeadComponents = headComponents.sort((a, b) => {
    if (a.type === b.type ||
       (a.type !== 'meta' && b.type !== 'meta')) return 0;
    if (a.type === 'meta') return 1;
    if (b.type === 'meta') return -1;
  });
  replaceHeadComponents(orderedHeadComponents);
};
