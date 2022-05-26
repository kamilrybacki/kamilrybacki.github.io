import React from 'react';

// @ts-ignore
import NavbarMenu from '@components/NavbarMenu';
// @ts-ignore
import LogoHamburger from '@components/LogoHamburger';

import {PageHeaderWrapper, MenuWrapper, ScaledNavbar} from './style';

const PageHeader = () => {
  return (
    <PageHeaderWrapper>
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
