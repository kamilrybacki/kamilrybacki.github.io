import React from "react"

import IndexSplash from '@components/IndexSplash'
import PageWrapper from "@components/PageWrapper" 

const IndexPage = () => {
  return (
    <>
      <PageWrapper 
        header={false} 
        footer={false} 
        extraClass='h-max w-max'
      >
        <IndexSplash/>
      </PageWrapper>
    </>
  )
}

export default IndexPage
