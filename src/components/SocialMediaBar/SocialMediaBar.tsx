import React from 'react';

import {SocialIcon} from 'react-social-icons';
import tw from 'tailwind-styled-components';

// @ts-ignore
import {TailwindThemeContext, TailwindThemeType} from '@components/PageWrapper';

const SocialMediaBarWrapper = tw.div`
    flex
    justify-between
    align-middle
    invisible

    sm:w-fit
    sm:visible
`;

const SocialMediaBar = () => {
  const tailwindTheme: TailwindThemeType = React.useContext(TailwindThemeContext);
  const links =[
    'https://www.linkedin.com/in/kamil-andrzej-rybacki/',
    'https://github.com/KamilRybacki',
    'https://www.facebook.com/kamilandrzejrybacki/',
    'https://www.instagram.com/kamilandrzejrybacki/',
    'https://twitter.com/rybacki_kamil',
  ];
  return (
    <SocialMediaBarWrapper>
      {
        links.map((link) => link ? <SocialIcon
          bgColor={tailwindTheme.colors?.primary['500']}
          url={link}
          style={{
            width: '1.5rem',
            height: '1.5rem',
            marginLeft: '0.75rem',
          }}
          key={link.split('/')[2]}
        /> : null,
        )
      }
    </SocialMediaBarWrapper>
  );
};

export default SocialMediaBar;
