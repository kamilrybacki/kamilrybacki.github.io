import React from 'react';

// @ts-ignore
import NavbarMenu from '@components/NavbarMenu';
// @ts-ignore
import LogoHamburger from '@components/LogoHamburger';
import SEO from '@components/SEO';

import {PageHeaderWrapper, MenuWrapper, ScaledNavbar} from './style';

const PageHeader = () => {
  return (
    <PageHeaderWrapper>
      <SEO/>
      <MenuWrapper>
        <LogoHamburger/>
        <ScaledNavbar>
          <NavbarMenu/>
        </ScaledNavbar>
      </MenuWrapper>
    </PageHeaderWrapper>
  );
};

export default PageHeader;
