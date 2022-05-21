import React, {ReactNode} from 'react';

import PageWrapper from '@components/PageWrapper';
import StackPresentation from '@components/StackPresentation';
import StyledMarkdown from '@components/StyledMarkdown';
import StyledSpinner from '@components/StyledSpinner';

import SmallerGallery from './SmallerGallery';

import {ProjectMetadata, ProjectInfoHeader, ProjectInfoSubheader,
  Abstract, ProjectLink, MarkdownTitle, ProjectEntryLayoutWrapper,
  ProjectTitle, ProjectPresentationHero, GalleryWrapper,
  BigPicture, ContentTitle, ContentWrapper, ReadmeButton} from './style';

type ProjectBodyProps = {
  readme: string,
  title: string,
  gallery: string[],
  abstract: string,
  techs: string[],
  link: string,
  content: string & ReactNode
}

const readmeError = `<strong>
    Failed loading Readme!
    </strong>
    <br/> Check the link in the post frontmatter.
`;

// eslint-disable-next-line max-len
const ProjectBody: React.FunctionComponent<ProjectBodyProps> = ({readme, title, gallery, abstract, techs, link, content}) => {
  const [currentReadme, setCurrentReadmeContent] = React.useState<string & ReactNode>('');
  const [spinner, setReadmeUi] = React.useState<JSX.Element>();
  const [isReadmeLoaded, setIfReadmeLoaded] = React.useState<boolean>(false);

  const handleReadmeLoad = async () => {
    const fetchReadme = async () => {
      setReadmeUi(<StyledSpinner id="readme_spinner" size={'5rem'}/>);
      await fetch(readme)
          .then((fetch) => fetch.text())
          .then((text) => {
            return text === '404: Not Found' ? readmeError : text;
          })
          .then((readmeContents) => {
            setCurrentReadmeContent(readmeContents);
          });
    };
    await fetchReadme();
  };

  React.useEffect(()=>{
    if (readme === 'none') {
      const readmeButtonElement = document.getElementById('readme_button');
      if (readmeButtonElement) {
        readmeButtonElement.outerHTML = '';
      }
    }
    if (currentReadme !== '') {
      setIfReadmeLoaded(true);
    }
  }, [currentReadme]);

  return (
    <PageWrapper extraClass="w-full">
      <ProjectEntryLayoutWrapper>
        <ProjectTitle>{title}</ProjectTitle>
        <ProjectPresentationHero>
          { gallery.length === 3 ?
            <GalleryWrapper>
              <BigPicture src={gallery[0]}/>
              <SmallerGallery pictures={gallery.slice(1)}/>
            </GalleryWrapper> : <></>
          }
          <ProjectMetadata>
            <ProjectInfoHeader>Project info</ProjectInfoHeader>
            <ProjectInfoSubheader className="my-2 ">Quick rundown:</ProjectInfoSubheader>
            <Abstract>{abstract}</Abstract>
            <ProjectInfoSubheader className="mt-1">Tech Stack:</ProjectInfoSubheader>
            <StackPresentation techs={techs}/>
            <ProjectLink href={link}>Link</ProjectLink>
          </ProjectMetadata>
        </ProjectPresentationHero>
        <ContentTitle>The whole story</ContentTitle>
        <ContentWrapper>
          <StyledMarkdown mdx={true}>{content}</StyledMarkdown>
          {isReadmeLoaded ?
            <>
              <MarkdownTitle>Project Readme.md</MarkdownTitle>
              <StyledMarkdown className="mt-10" linkTarget="_blank">{currentReadme}</StyledMarkdown>
            </> :
              spinner ?
              spinner :
              <ReadmeButton id="readme_button" onClick={() => {
                handleReadmeLoad();
              }}>Load Readme.md</ReadmeButton>
          }
        </ContentWrapper>
      </ProjectEntryLayoutWrapper>
    </PageWrapper>
  );
};

export default ProjectBody;
