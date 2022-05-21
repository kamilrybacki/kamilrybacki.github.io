import React from 'react';

import PageWrapper from '@components/PageWrapper';

import {FourOhFourWrapper, FourOhFour,
  FourOhFourErrorMessage, HomeLink} from '@style/pages/404';

const NotFoundPage = () => {
  return (
    <PageWrapper header={false} footer={false}>
      <FourOhFourWrapper>
        <FourOhFour>404</FourOhFour>
        <FourOhFourErrorMessage>Page not found!</FourOhFourErrorMessage>
        <HomeLink to='/'>Return to homepage</HomeLink>
      </FourOhFourWrapper>
    </PageWrapper>
  );
};

export default NotFoundPage;
