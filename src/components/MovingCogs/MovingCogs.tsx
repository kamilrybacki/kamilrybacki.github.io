import React from 'react';

import tw from 'tailwind-styled-components';
import {graphql, useStaticQuery} from 'gatsby';

import Cog from './Cog';

import {AssetsPhotosQuery, Node} from '@root/graphql-types'

const CogsWrapper = tw.div`
    -z-50
    overflow-hidden
`;

const MovingCogs = () => {
  const [cogs, loadCogs] = React.useState<JSX.Element[]>([]);

  const cogSvgFiles = useStaticQuery(graphql`
        query AssetsPhotos {
            allFile(filter: {sourceInstanceName: {eq: "images"}, 
                    absolutePath: {regex: "/images\/cogs\/cog/"}})
                {
                    edges {
                    node {
                        id
                        publicURL
                    }
                }
            }
        }`,
  );

  const numberOfCogs = 10;

  React.useEffect(() => {
    const cogsList: AssetsPhotosQuery = cogSvgFiles.allFile.edges;
    const cogsUrlList = cogsList.map((cog: Node) => cog?.node.publicURL);
    const emptyIdList = Array.from(Array(numberOfCogs).keys());

    const cogIdList = emptyIdList.map(() => {
      return Math.floor(Math.random()*cogsUrlList.length);
    });
    const spawnedCogs = cogIdList.map((cogId, index) => {
      return (<Cog src={cogsUrlList[cogId]} key={`cog_${index}`}/>);
    });
    loadCogs(spawnedCogs);
  }, []);

  return (
    <>
      {cogs ? <CogsWrapper>{cogs}</CogsWrapper> : ''}
    </>
  );
};

export default MovingCogs;
