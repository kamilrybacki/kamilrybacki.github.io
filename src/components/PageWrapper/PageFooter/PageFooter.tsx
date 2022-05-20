import React from 'react';

import SocialMediaBar from '../../SocialMediaBar';
import {PageFooterWrapper, PageFooterCopyright} from './style';

type PageFooterProps = {

}
const PageFooter: React.FunctionComponent<PageFooterProps> = () => {
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
