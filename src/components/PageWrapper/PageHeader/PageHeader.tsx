import React from 'react';
import tw from 'tailwind-styled-components';

import NavbarMenu from '@components/NavbarMenu'
import ProfPic from '@images/prof_pic.svg'

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

const TopMenuProfilePicture = tw.img`
    w-1/5
    p-0
    m-0
    rounded-full
    ring-4
    ring-primary-500
    bg-secondary-500
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
                <TopMenuProfilePicture src={ProfPic} alt="My face"/>
                <NavbarWithSeparator>
                    <Separator/>
                    <NavbarMenu/>
                </NavbarWithSeparator>
            </MenuWrapper>
        </PageHeaderWrapper>
    )
}

export default PageHeader
