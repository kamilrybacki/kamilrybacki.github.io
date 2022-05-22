import React from 'react';

// @ts-ignore
import IndexSplash from '@components/IndexSplash';
// @ts-ignore
import PageWrapper from '@components/PageWrapper';

const IndexPage = () => {
  return (
    <>
      <PageWrapper
        header={false}
        footer={false}
        extraClass="h-max w-max flex flex-col justify-center child:p-0"
      >
        <IndexSplash/>
      </PageWrapper>
    </>
  );
};

export default IndexPage;
