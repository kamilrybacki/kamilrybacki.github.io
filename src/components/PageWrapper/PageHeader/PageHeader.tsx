import React from 'react';

import NavbarMenu from '@components/NavbarMenu';
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
