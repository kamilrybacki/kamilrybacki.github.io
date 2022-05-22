import React from 'react';

// @ts-ignore
import NavbarMenu from '@components/NavbarMenu';
// @ts-ignore
import LogoSVG from '@images/logo.svg';

import {LogoHamburgerWrapper, LogoSource,
  LogoWrapper, DropdownMenu} from './style';

const LogoHamburger = () => {
  const [isMenuOpen, setIfMenuOpen] = React.useState<boolean>(false);
  const [menu, setMenu] = React.useState<JSX.Element>(<></>);

  React.useEffect(()=>{
    setTimeout(()=>{
      setMenu( isMenuOpen ?
                <DropdownMenu><NavbarMenu/></DropdownMenu> :
                <></>,
      );
    }, 1);
  }, [isMenuOpen]);

  return (
    <>
      <LogoHamburgerWrapper
        onClick={()=>{
          setIfMenuOpen(!isMenuOpen);
        }}
        onBlur={()=>{
          setIfMenuOpen(false);
        }}
      >
        <LogoWrapper>
          <LogoSource src={LogoSVG}/>
        </LogoWrapper>
      </LogoHamburgerWrapper>
      {menu}
    </>
  );
};

export default LogoHamburger;
