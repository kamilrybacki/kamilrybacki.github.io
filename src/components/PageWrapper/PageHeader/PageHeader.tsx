import React from 'react';
import tw from 'tailwind-styled-components';
import {Link} from "gatsby"

import NavbarMenu from '@components/NavbarMenu'

type PageHeaderProps = {

}

const PageHeaderWrapper = tw.header`
    flex
    flex-row
    w-full
`

const MenuWrapper = tw.div`
    inline-flex
    gap-0
    w-max
    max-w-5xl
    p-5
    px-5
    md:px-10
`

const TopMenuLogo = tw(Link)`
    flex
    justify-center
    align-middle
    text-primary-500
    font-display
    font-bold
    text-4xl
    md:text-6xl
    w-fit
    h-fit
    m-0
    p-2
    md:py-4
    md:px-3
    rounded-full
    md:ring-[0.25rem]
    ring-[0.125rem]
    ring-primary-500
    bg-secondary-500
    duration-500

    hover:bg-accent-100
    hover:text-primary-600
    hover:ring-[0.25rem]
    md:hover:ring-[0.125rem]
`

const TopMenuText = tw.div`
    relative
    flex
    m-0
    p-0
    gap-0
    w-fit
    h-full
    justify-center
    duration-500

    hover:scale-90
    hover:-rotate-12
`

const TopMenuLogoFirstLetter = tw.span`
    relative
    m-0
    p-0
    rotate-180
`

const TopMenuLogoSecondLetter = tw.span`
    m-0
    p-0
`

const NavbarWithSeparator = tw.div`
    relative
    top-2
    w-fit
    invisible
    duration-0
    mx-4
    h-0

    md:origin-left
    md:scale-[0.6]
    md:visible
`

const Separator = tw.hr`
    -my-2
    p-0
    h-1
    bg-primary-100
    border-0
    -z-50
`

const PageHeader: React.FunctionComponent<PageHeaderProps> = () => {
    return(
        <PageHeaderWrapper>
            <MenuWrapper>
                <TopMenuLogo to='/'>
                    <TopMenuText>
                        <TopMenuLogoFirstLetter>K</TopMenuLogoFirstLetter>
                        <TopMenuLogoSecondLetter>R</TopMenuLogoSecondLetter>
                    </TopMenuText>
                </TopMenuLogo>
                <NavbarWithSeparator>
                    <Separator/>
                    <NavbarMenu/>
                </NavbarWithSeparator>
            </MenuWrapper>
        </PageHeaderWrapper>
    )
}

export default PageHeader
