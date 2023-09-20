import type { MDXInstance } from 'astro';
import * as React from 'react';

import * as Style from './style';

interface PostsViewerProps {
  articles: MDXInstance<Record<string, any>>[];
  poems: MDXInstance<Record<string, any>>[];
}

const PostsViewer = ({articles, poems}: PostsViewerProps) => {
  const [selectedPosts, setSelectedPosts] = React.useState(articles);

  return (
    <div className="posts-viewer">
      <h1>Posts</h1>
      <Style.PostsMenu>
        <div>
          <button onClick={() => setSelectedPosts(articles)}>Articles</button>
          <button onClick={() => setSelectedPosts(poems)}>Poems</button>
        </div>
        <input type="text" placeholder="Search" />
      </Style.PostsMenu>
      <Style.PostsWrapper>
        {
          selectedPosts.map((post) => (
            <Style.PostCard key={post.file}>
              {
                post.frontmatter.image ?
                  <img
                    src={post.frontmatter.image.src}
                    alt={post.frontmatter.image.alt}
                  /> :
                  null
              }
              <h2 className='font-bold text-3xl mb-3 font-display'>{post.frontmatter.title}</h2>
              <p className='font-body'>{post.frontmatter.description}</p>
            </Style.PostCard>
          ))
        }
      </Style.PostsWrapper>
    </div>
  )
};

export default PostsViewer;
