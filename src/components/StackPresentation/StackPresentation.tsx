import React from 'react';
import {useStaticQuery, graphql} from 'gatsby';

// @ts-ignore
import StyledSpinner from '@components/StyledSpinner';

import {StackPresentationWrapper, StackIcon, StackPresentationContent} from './style';

// @ts-ignore
import {Edge} from '@root/graphql-types';

const imagesQuery = graphql`
 query TechImages {
    allFile(filter: {absolutePath: {regex: "/techs/"}}) {
        edges {
            node {
                name
                publicURL
            }
        }
    }
 }
`;

type StackPresentationProps = {
    techs: string[]
}

// eslint-disable-next-line max-len
const StackPresentation: React.FunctionComponent<StackPresentationProps> = ({techs}) => {
  const [icons, setIcons] = React.useState([]);
  const techIcons = useStaticQuery(imagesQuery);

  React.useEffect(()=>{
    setIcons(
        techIcons.allFile.edges
            .filter((image: Edge) => techs.includes(image.node.name))
            .map((image: Edge) => image.node.publicURL)
            .map((iconUrl: string, index: number) => {
              return (
                <StackIcon
                  key={`stack_${index}`}
                  src={iconUrl}
                  alt='Stack icon'
                />
              );
            }),
    );
  }, []);

  return (
    <StackPresentationWrapper>
      <StackPresentationContent>
        {icons ? icons : <StyledSpinner size="30%"/>}
      </StackPresentationContent>
    </StackPresentationWrapper>
  );
};

export default StackPresentation;
