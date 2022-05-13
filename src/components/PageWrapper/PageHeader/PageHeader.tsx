import React from "react";
import tw from "tailwind-styled-components";

import NavbarMenu from "@components/NavbarMenu"
import LogoHamburger from "@components/LogoHamburger"
import LogoFirstHalfSource from "@images/logo_1.svg"

const PageHeaderWrapper = tw.header`
    flex
    flex-row
    w-full
`

const MenuWrapper = tw.div`
    flex
    gap-0
    w-max
    max-w-5xl
    p-5
    h-fit

    md:px-10
    lg:py-10
`

const BigMenuAccent = tw.img`
    invisible
    w-0
    h-0

    lg:visible
    lg:relative
    lg:m-0
    lg:p-0
    lg:rotate-180
    lg:w-auto
    lg:h-10
`

const ScaledNavbar = tw.div`
    w-fit
    invisible
    duration-0
    mx-3
    h-0

    md:relative
    md:-ml-8
    md:origin-top-left
    md:scale-[0.6]
    md:visible

    lg:-top-2
    lg:ml-3
    lg:scale-[0.75]
`

const PageHeader = () => {
    return(
        <PageHeaderWrapper>
            <MenuWrapper>
                <LogoHamburger/>
                <BigMenuAccent src={LogoFirstHalfSource}/>
                <ScaledNavbar>
                    <NavbarMenu/>
                </ScaledNavbar>
            </MenuWrapper>
        </PageHeaderWrapper>
    )
}

export default PageHeader
