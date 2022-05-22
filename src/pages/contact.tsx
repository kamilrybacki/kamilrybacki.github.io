import React from 'react';

import {SocialIcon} from 'react-social-icons';

import PageWrapper, {TailwindThemeContext, TailwindThemeType} from '@components/PageWrapper';
import ContactForm from '@components/ContactForm';

import {ContactRoutes, VerticalSeparator, HorizontalSeparator,
  ContactRouteInfoWrapper, ContactRouteTitle, ContactRouteTitleAccent, ContactRoute,
  SocialMediaWrapper, SocialMedia, SocialMediaLabel, SocialMediaIconStyle} from '@style/pages/contact';

const socialMediaList =[
  ['LinkedIn', 'https://www.linkedin.com/in/kamil-andrzej-rybacki/'],
  ['GitHub', 'https://github.com/KamilRybacki'],
  ['Facebook', 'https://www.facebook.com/kamilandrzejrybacki/'],
  ['Instagram', 'https://www.instagram.com/kamilandrzejrybacki/'],
  ['Twitter', 'https://twitter.com/rybacki_kamil'],
];

const ContactPage = () => {
  const [iconColor, setIconColor] = React.useState<string>('black');
  const tailwindTheme: TailwindThemeType = React.useContext(TailwindThemeContext);

  React.useEffect(()=>{
    setIconColor(tailwindTheme?.colors ?
        tailwindTheme.colors.accent['500'] :
        'black');
  }, [tailwindTheme]);

  return (
    <PageWrapper footer={false}>
      <ContactRoutes>
        <ContactRoute>
          <ContactRouteInfoWrapper>
            <ContactRouteTitle>You can </ContactRouteTitle>
            <ContactRouteTitle className="">catch me here</ContactRouteTitle>
            <ContactRouteTitle> ...</ContactRouteTitle>
          </ContactRouteInfoWrapper>
          <SocialMediaWrapper>
            {socialMediaList ? socialMediaList.map((socialMedia) => {
              const keyBase = socialMedia[1].split('/')[2];
              return (
                <SocialMedia onClick={()=>{
                  window.location.href=socialMedia[1];
                } } key={`${keyBase}_wrapper`}>
                  <SocialMediaLabel
                    key={`${keyBase}_label`}
                  >
                    {socialMedia[0]}
                  </SocialMediaLabel>
                  <SocialIcon
                    bgColor={iconColor}
                    url={socialMedia[1]}
                    key={`${keyBase}_icon`}
                    style={SocialMediaIconStyle}
                  />
                </SocialMedia>
              );
            },
            ): ''}
          </SocialMediaWrapper>
        </ContactRoute>
        <VerticalSeparator/>
        <HorizontalSeparator/>
        <ContactRoute>
          <ContactRouteInfoWrapper>
            <ContactRouteTitle>... or use my contact </ContactRouteTitle>
            <ContactRouteTitleAccent>form</ContactRouteTitleAccent>
          </ContactRouteInfoWrapper>
          <ContactForm endpoint="https://formsubmit.co/d2f32602d5a315ecf57a8ddf8c45f3b9"/>
        </ContactRoute>
      </ContactRoutes>
    </PageWrapper>
  );
};

export default ContactPage;
