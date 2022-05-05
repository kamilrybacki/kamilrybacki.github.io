import React from "react"

import IndexSplash from '@components/IndexSplash'
import MovingCogs from '@components/MovingCogs'
import PageWrapper from "@components/PageWrapper" 

const IndexPage = () => {
  return (
    <>
      <MovingCogs/>
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
