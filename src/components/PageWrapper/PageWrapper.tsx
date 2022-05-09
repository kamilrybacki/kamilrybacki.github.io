import React from "react";

import tw from "tailwind-styled-components"

import PageHeader from "./PageHeader"
import PageFooter from "./PageFooter"
import PageContent from "./PageContent"
import MovingCogs from "@components/MovingCogs"

type PageWrapperProps = {
    header: boolean,
    footer: boolean,
    extraClass: string,
    children: JSX.Element | JSX.Element[]
}

const PageWrapperLayout = tw.main`
    relative
    flex
    flex-col
    align-middle
    w-full
    h-full
    mx-auto
`

const PageWrapper: React.FunctionComponent<PageWrapperProps> = ({ header = true, footer = true, extraClass = "", children }) => {
    return (
        <PageWrapperLayout className={extraClass}>
            <MovingCogs/>
            {header ? <PageHeader/> : ""}
            <PageContent>
                {children}
            </PageContent>
            {footer ? <PageFooter/> : ""}
        </PageWrapperLayout>
    )
};

PageWrapper.defaultProps = {
    header: true
}

export default PageWrapper
