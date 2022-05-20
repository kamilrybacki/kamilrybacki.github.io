import React from 'react';
import tw from 'tailwind-styled-components';

import AboutMePic from '@images/aboutme_pic.jpg';
import PageWrapper from '@components/PageWrapper';
import StyledMarkdown from '@components/StyledMarkdown';
import DropdownSections from '@components/DropdownSections';
import {Section} from '@components/DropdownSections';

const AboutMeWrapper = tw.section`
    relative
    flex
    flex-col
    gap-2
    -ml-5
    h-[100vh]

    md:w-[80vw]
    md:gap-10
    md:mx-auto
    md:grid
    md:grid-cols-2
`;

const AboutMePicWrapper = tw.img`
    rounded-full
    border-2
    drop-shadow-2xl
    h-1/2
    mx-auto

    md:ml-auto
    md:mr-0
    md:border-4
    md:h-3/4
`;

const AboutMeSectionParagraph = tw(StyledMarkdown)`
    font-body
    text-justify

    md:text-xl
`;

const AboutPage = () => {
  return (
    <PageWrapper footer={false}>
      <AboutMeWrapper>
        <AboutMePicWrapper src={AboutMePic}/>
        <DropdownSections extraClass="my-5 md:my-10 md:mx-10 md:ml-5">
          <Section title="Who am I?">
            <AboutMeSectionParagraph>
                **In short**, I am a software developer
                 and organizational journal editor from **Gdańsk**.
            </AboutMeSectionParagraph>
            <AboutMeSectionParagraph>
                I **love** playing around with new technologies 
                and **applying them** in my professional workflow
                and everyday life, which can be seen in **my projects**.
            </AboutMeSectionParagraph>
            <AboutMeSectionParagraph>
                Apart from **softdev**, my interests are **electronics**, [**3d printing**](https://www.printables.com/pl/social/226178-kamil-rybacki) and spending time together with other people over **beer** and [**horrendously complicated boardgames**](https://boardgamegeek.com/user/Kokoszko).
            </AboutMeSectionParagraph>
          </Section>
          <Section title="What do I do?">
            <AboutMeSectionParagraph>
                **In terms of my programming job**,
                I aim to provide solutions to problems encountered in
                **data mining** and **integration of external APIs/databases**
                with **user interfaces**.
            </AboutMeSectionParagraph>
            <AboutMeSectionParagraph>
                Currently, I am **mostly** doing **backend** tasks
                and my go-to language is **Python** due to a
                straightforward **integration with popular
                computation suites/platforms** (such as JupyterLab)
                and **custom APIs created with FastAPI and/or Celery**.
            </AboutMeSectionParagraph>
            <AboutMeSectionParagraph>
                On the other hand, I am also an **organizational editor** of [**TASK Quarterly**](https://journal.mostwiedzy.pl/TASKQuarterly) **IT scientific journal** i.e. I am responsible for **establishing collaborations with indexation databases**
                (e.g. [Directory of Open Access Journals](https://doaj.org/toc/1428-6394)) or other organizations and I am **overseeing integration of tools** such as [Open Journal Systems](https://pkp.sfu.ca/ojs/) into our publishing workflow.
            </AboutMeSectionParagraph>
          </Section>
          <Section title="What do I want?">
            <AboutMeSectionParagraph>
                **When it comes to this site**,
                I want to simply share my knowledge with others,
                while also having a **cool looking**
                portfolio to showcase my work.
            </AboutMeSectionParagraph>
            <AboutMeSectionParagraph>
                As for my **carrier path**,
                I want to specialize more into **DevOps** and **IaC**,
                while also improving my **data mining** expertise
                and knowledge about **integrating backend services**
                with **intuitive user interfaces**
                (both in terms of graphical UIs and easy-to-use APIs).
            </AboutMeSectionParagraph>
            <AboutMeSectionParagraph>
                Additionally,
                I am constantly working on my **design** skills to
                create the aforementioned interfaces **NOT**
                make my users gouge their eyes out.
                So **in short**, I want to eventually be
                a **Full-stack developer** with
                some **UI/UX skills under my belt**.
            </AboutMeSectionParagraph>
          </Section>
        </DropdownSections>
      </AboutMeWrapper>
    </PageWrapper>
  );
};

export default AboutPage;
