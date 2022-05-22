import React from 'react';

// @ts-ignore
import SocialMediaBar from '@components/SocialMediaBar';

import {PageFooterWrapper, PageFooterCopyright} from './style';

const PageFooter: React.FunctionComponent = () => {
  return (
    <PageFooterWrapper>
      <PageFooterCopyright>
          © Kamil Rybacki {new Date().getFullYear()}
      </PageFooterCopyright>
      <SocialMediaBar/>
    </PageFooterWrapper>
  );
};

export default PageFooter;
