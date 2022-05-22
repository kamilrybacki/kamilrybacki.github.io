import React from 'react';

import {PrismLight} from 'react-syntax-highlighter';
import {vscDarkPlus} from 'react-syntax-highlighter/dist/cjs/styles/prism';

import tsx from 'react-syntax-highlighter/dist/cjs/languages/prism/tsx';
import typescript from 'react-syntax-highlighter/dist/cjs/languages/prism/typescript';
import scss from 'react-syntax-highlighter/dist/cjs/languages/prism/scss';
import bash from 'react-syntax-highlighter/dist/cjs/languages/prism/bash';
import markdown from 'react-syntax-highlighter/dist/cjs/languages/prism/markdown';
import json from 'react-syntax-highlighter/dist/cjs/languages/prism/json';
import python from 'react-syntax-highlighter/dist/cjs/languages/prism/python';
import javascript from 'react-syntax-highlighter/dist/cjs/languages/prism/javascript';
import jsx from 'react-syntax-highlighter/dist/cjs/languages/prism/jsx';
import css from 'react-syntax-highlighter/dist/cjs/languages/prism/css';

PrismLight.registerLanguage('tsx', tsx);
PrismLight.registerLanguage('typescript', typescript);
PrismLight.registerLanguage('scss', scss);
PrismLight.registerLanguage('bash', bash);
PrismLight.registerLanguage('markdown', markdown);
PrismLight.registerLanguage('json', json);
PrismLight.registerLanguage('python', python);
PrismLight.registerLanguage('javascript', javascript);
PrismLight.registerLanguage('jsx', jsx);
PrismLight.registerLanguage('css', css);

type SyntaxHighlighterProps = {
    children: string | string[]
    language: string
    hasMeta: boolean
    lineProps: object
};

// eslint-disable-next-line max-len
const SyntaxHighlighter:React.FunctionComponent<SyntaxHighlighterProps> = ({children, language, hasMeta, lineProps}) => {
  return (
    // @ts-ignore
    <PrismLight
      style={vscDarkPlus}
      language={language}
      className='codeStyle'
      showLineNumbers={true}
      wrapLines={hasMeta}
      useInlineStyles={true}
      lineProps={lineProps}
    >
      {children}
    </PrismLight>
  );
};

export default SyntaxHighlighter;
