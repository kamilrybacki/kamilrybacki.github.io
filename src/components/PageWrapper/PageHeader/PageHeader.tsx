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
    max-w-2xl
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
    rounded-full
    ring-8
    ring-primary-500
    bg-secondary-500
    hover:bg-accent-100
    hover:text-primary-600
    hover:ring-4
    duration-500
`

const NavbarWithSeparator = tw.div`
    relative
    top-1/4
    w-fit
`

const Separator = tw.hr`
    -my-2
    -mx-2
    w-full
    p-0
    h-1
    bg-primary-500
    -z-50
`

const PageHeader: React.FunctionComponent<PageHeaderProps> = () => {
    return(
        <PageHeaderWrapper>
            <MenuWrapper>
                <TopMenuLogo to='/'>KR</TopMenuLogo>
                <NavbarWithSeparator>
                    <Separator/>
                    <NavbarMenu/>
                </NavbarWithSeparator>
            </MenuWrapper>
        </PageHeaderWrapper>
    )
}

export default PageHeader
