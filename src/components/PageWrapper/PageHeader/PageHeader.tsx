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
    -mx-20
    gap-0
    w-max
    max-w-5xl
    scale-[0.65]
`

const TopMenuLogo = tw(Link)`
    flex
    justify-center
    align-middle
    text-[4.5rem]
    text-primary-500
    font-display
    font-bold
    w-[7rem]
    h-[7rem]
    m-0
    p-2
    rounded-full
    ring-8
    ring-primary-500
    bg-secondary-500
    duration-500

    hover:bg-accent-100
    hover:text-primary-600
    hover:ring-4
`

const TopMenuText = tw.div`
    relative
    -left-[0.1rem]
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
    top-[0.1rem]
    right-[-0.5rem]
    rotate-180
`

const TopMenuLogoSecondLetter = tw.span`
`

const NavbarWithSeparator = tw.div`
    relative
    top-1/4
    mx-3
    w-fit
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
