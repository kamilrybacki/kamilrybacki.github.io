import React from 'react';

// @ts-ignore
import NavbarMenu from '@components/NavbarMenu';
// @ts-ignore
import ProfPic from '@images/prof_pic.svg';

import {IndexSplashWrapper, TitleWithNavbar,
  Separator, MainTitle, MainTitleWord,
  SubTitle, IndexProfilePicture} from './style';

const IndexSplash = () => {
  return (
    <IndexSplashWrapper id="splash-wrapper">
      <IndexProfilePicture src={ProfPic} alt="My face"/>
      <TitleWithNavbar>
        <MainTitle>
          <MainTitleWord>Kamil</MainTitleWord>
          <MainTitleWord>Rybacki</MainTitleWord>
        </MainTitle>
        <SubTitle>Pitch the idea.<br/> I will create the experience.</SubTitle>
        <Separator/>
        <NavbarMenu/>
      </TitleWithNavbar>
    </IndexSplashWrapper>
  );
};

export default IndexSplash;

