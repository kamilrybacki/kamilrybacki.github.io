import React from 'react';

import tw from 'tailwind-styled-components';
import {graphql, useStaticQuery} from 'gatsby';

import Cog from './Cog';

const CogsWrapper = tw.div`
    -z-50
    overflow-hidden
`;

const MovingCogs = () => {
  const [cogs, loadCogs] = React.useState();

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
    const cogsList = cogSvgFiles.allFile.edges;
    const cogsUrlList = cogsList.map((cog: object) => cog?.node.publicURL);
    const emptyIdList = Array.from(Array(numberOfCogs).keys());

    const cogIdList = emptyIdList.map(() => {
      return Math.floor(Math.random()*cogsUrlList.length);
    });
    const spawnedCogs = cogIdList.map((cog_id, index) => {
      return (<Cog src={cogsUrlList[cog_id]} key={`cog_${index}`}/>);
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
