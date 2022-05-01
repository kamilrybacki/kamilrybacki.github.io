import * as React from "react"
import styled from 'styled-components'

import IndexSplash from '@components/IndexSplash'
import PageWrapper from "@components/PageWrapper" 

import IndexBg from '@images/index_bg.svg'

const IndexPageBackground = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 0;
  padding: 0;
  width: screen;
  height: screen;

  &::before {
    content: "";
    position: absolute;
    top: 0px;
    right: 0px;
    bottom: 0px;
    left: 0px;
    background-image: url(${IndexBg});
    opacity: 0.075;
    z-index: -99;
  }
`
const IndexPage = () => {
  return (
    <IndexPageBackground>
      <PageWrapper header={false}>
        <IndexSplash/>
      </PageWrapper>
    </IndexPageBackground>
  )
}

export default IndexPage
