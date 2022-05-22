import React from 'react';

import tw from 'tailwind-styled-components';

import PageHeader from './PageHeader';
import PageFooter from './PageFooter';
import PageContent from './PageContent';
// @ts-ignore
import MovingCogs from '@components/MovingCogs';

const PageWrapperLayout = tw.main`
    relative
    flex
    flex-col
    align-middle
    w-full
    h-full
    mx-auto
`;

const currentTailwindTheme = require('@style/theme');
const TailwindThemeContext = React.createContext(currentTailwindTheme);

type PageWrapperProps = {
    header: boolean,
    footer: boolean,
    extraClass: string,
    children: JSX.Element | JSX.Element[]
}

// eslint-disable-next-line max-len
const PageWrapper: React.FunctionComponent<PageWrapperProps> = ({header = true, footer = true, extraClass = '', children}) => {
  return (
    <TailwindThemeContext.Provider value={currentTailwindTheme}>
      <PageWrapperLayout className={extraClass}>
        <MovingCogs/>
        {header ? <PageHeader/> : ''}
        <PageContent>
          {children}
        </PageContent>
        {footer ? <PageFooter/> : ''}
      </PageWrapperLayout>
    </TailwindThemeContext.Provider>
  );
};

export {TailwindThemeContext};
export default PageWrapper;
