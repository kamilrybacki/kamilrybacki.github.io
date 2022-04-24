import React from 'react'; // importing FunctionComponent
import styled from 'styled-components'
import tw from 'tailwind-styled-components'

import PageHeader from './PageHeader'
import PageFooter from './PageFooter'

type PageWrapperProps = {
    children: JSX.Element | JSX.Element[]
}

const RawPageWrapperLayout = styled.main`
`

const PageWrapperLayout = tw(RawPageWrapperLayout)`
    w-screen
    flex
    items-center
    justify-center
`

const PageWrapper: React.FunctionComponent<PageWrapperProps> = ({ children }) => {
    return (
        <>
            <PageHeader/>
                <PageWrapperLayout>
                    {children}
                </PageWrapperLayout>
            <PageFooter/>
        </>
    )
};

export default PageWrapper
