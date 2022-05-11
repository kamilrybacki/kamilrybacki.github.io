import React from "react";
import tw from "tailwind-styled-components";
import {Link} from "gatsby"

import NavbarMenu from "@components/NavbarMenu"
import LogoFirstHalfSource from "@images/logo_1.svg"
import LogoSecondHalfSource from "@images/logo_2.svg"

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
    font-heading
    font-bold
    text-4xl
    md:text-6xl
    w-20
    h-20
    m-0
    p-2
    md:py-4
    md:px-3
    rounded-full
    border-4
    border-primary-100
    bg-secondary-500
    duration-1000

    hover:border-primary-500
    hover:bg-accent-100
    hover:text-primary-600
    hover:-rotate-12
    child:hover:scale-110
`

const Logo = tw.div`
    relative
    flex
    m-0
    p-0
    gap-0
    justify-center
`

const LogoFirstHalf = tw.img`
    relative
    m-0
    p-0
`

const LogoSecondHalf = tw.img`
    m-0
    p-0
`

const ScaledNavbar = tw.div`
    w-fit
    invisible
    duration-0
    mx-3
    h-0

    md:origin-left
    md:scale-[0.6]
    md:visible
`

const PageHeader = () => {
    return(
        <PageHeaderWrapper>
            <MenuWrapper>
                <TopMenuLogo to="/">
                    <Logo>
                        <LogoFirstHalf src={LogoFirstHalfSource}/>
                        <LogoSecondHalf src={LogoSecondHalfSource}/>
                    </Logo>
                </TopMenuLogo>
                <ScaledNavbar>
                    <NavbarMenu/>
                </ScaledNavbar>
            </MenuWrapper>
        </PageHeaderWrapper>
    )
}

export default PageHeader
