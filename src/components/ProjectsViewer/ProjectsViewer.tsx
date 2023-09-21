import * as React from 'react';
import * as Style from './style';

import '@styles/floating.css';

interface PostsViewerProps {
  data: any[];
}

const ProjectsViewer = ({data}: PostsViewerProps) => {
  return (
    <Style.ProjectsCaret>
      {
        data && data.map((post) => {
          const frontmatter = post.data;
          return (
            <Style.Project key={`${frontmatter.title}-card`}>
              <h1>{frontmatter.title}</h1>
              <p>{frontmatter.description}</p>
            </Style.Project>
          );
        })
      }
    </Style.ProjectsCaret>
  )
};

export default ProjectsViewer;
