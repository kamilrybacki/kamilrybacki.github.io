import React from 'react';

import {SectionWrapper, SectionTitleWrapper,
  SectionTitle, SectionContent} from './style';

type SectionProps = {
    children: JSX.Element | JSX.Element[]
    title: string
}

const Section: React.FunctionComponent<SectionProps> = ({children, title}) => {
  const [sectionActive, setIfSectionActive] = React.useState<boolean>(false);

  const handleSectionState = () => {
    setIfSectionActive(!sectionActive);
  };

  return (
    <SectionWrapper>
      <SectionTitleWrapper onClick={handleSectionState}>
        <SectionTitle>{title}</SectionTitle>
      </SectionTitleWrapper>
      {sectionActive ? <SectionContent>{children}</SectionContent> : ''}
    </SectionWrapper>
  );
};

export default Section;
