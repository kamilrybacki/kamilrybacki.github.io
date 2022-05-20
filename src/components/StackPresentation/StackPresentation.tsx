import React from 'react';
import {useStaticQuery, graphql} from 'gatsby';

import StyledSpinner from '@components/StyledSpinner';

import {StackPresentationWrapper, StackIcon} from './style';

const imagesQuery = graphql`
 query TechsImagesQuery {
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
    techs: Array<string>
}

// eslint-disable-next-line max-len
const StackPresentation: React.FunctionComponent<StackPresentationProps> = ({techs}) => {
  const [icons, setIcons] = React.useState([]);
  const techIcons = useStaticQuery(imagesQuery);

  React.useEffect(()=>{
    setIcons(
        techIcons.allFile.edges
            .filter((image) => techs.includes(image.node.name))
            .map((image) => image.node.publicURL)
            .map((iconUrl: string, index: number) => {
              const iconImgAlt = iconUrl.split('/').at(-1).replace('.svg', '');
              return (
                <StackIcon
                  key={`stack_${index}`}
                  src={iconUrl}
                  alt={iconImgAlt}
                />
              );
            }),
    );
  }, []);

  return (
    <StackPresentationWrapper>
      {icons ? icons : <StyledSpinner size="30%"/>}
    </StackPresentationWrapper>
  );
};

export default StackPresentation;
