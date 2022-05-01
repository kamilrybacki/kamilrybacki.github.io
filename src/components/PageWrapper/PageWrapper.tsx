import React from 'react';

import tw from 'tailwind-styled-components'

import PageHeader from './PageHeader'
import PageFooter from './PageFooter'
import PageContent from './PageContent'

type PageWrapperProps = {
    header: string,
    children: JSX.Element | JSX.Element[]
}

const PageWrapperLayout = tw.main`
    flex
    flex-col
    justify-center
    align-middle
    h-auto
    w-screen
    m-0
`

const PageWrapper: React.FunctionComponent<PageWrapperProps> = ({ header, children }) => {
    return (
        <PageWrapperLayout>
            {header ? <PageHeader/> : ''}
            <PageContent>
                {children}
            </PageContent>
            <PageFooter/>
        </PageWrapperLayout>
    )
};

export default PageWrapper
