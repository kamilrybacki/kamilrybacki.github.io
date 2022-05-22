import React from 'react';

import {graphql, StaticQuery} from 'gatsby';

import ProjectBody from './body';

// @ts-ignore
import {Mdx, Edge, ProjectsThumbnailsQuery} from '@root/graphql-types';

type ProjectEntryLayoutProps = {
  pageContext: Mdx
}

const projectsGalleryList = graphql`
      query ProjectsThumbnails {
          allFile(filter: {relativePath: {regex: "/galleries/"}}) {
              edges {
                  node {
                      absolutePath
                      publicURL
                  }
              }
          }
      }
  `;

const ProjectEntryLayout: React.FunctionComponent<ProjectEntryLayoutProps> = ({pageContext: context}) => {
  return (
    // @ts-ignore
    <StaticQuery
      query={projectsGalleryList}
      render={(projectsGalleryList: ProjectsThumbnailsQuery) => {
        const galleryPath = `galleries/${context.frontmatter.gallery}`;
        const matchingProjectGallery = projectsGalleryList.allFile.edges.map(
            (edge: Edge) => {
              if (edge.node.absolutePath.includes(galleryPath)) {
                return edge.node.publicURL;
              }
            },
        ).filter(Boolean);
        return (
          <ProjectBody
            readme={context.frontmatter.readme}
            title={context.frontmatter.title}
            gallery={matchingProjectGallery}
            abstract={context.frontmatter.abstract}
            techs={context.frontmatter.techs}
            link={context.frontmatter.link}
            content={context.content}
          />
        );
      }}
    />
  );
};

export default ProjectEntryLayout;
