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
    inline-flex
    gap-0
    w-max
    max-w-5xl
    p-5

    md:px-10
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
    lg:h-1/2
    lg:my-auto
`

const ScaledNavbar = tw.div`
    w-fit
    invisible
    duration-0
    mx-3
    h-0

    md:-ml-8
    md:origin-left
    md:scale-[0.6]
    md:visible

    lg:ml-3
    lg:relative
    lg:top-3
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
