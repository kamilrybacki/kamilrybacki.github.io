import * as React from 'react';
import * as Style from './style';

import '@styles/floating.css';

interface PostsViewerProps {
  articles: any[];
  poems: any[];
}

const PostsViewer = ({articles, poems}: PostsViewerProps) => {
  const [selectedPosts, setSelectedPosts] = React.useState(articles);

  return (
    <div className="posts-viewer">
      <h1 className='text-9xl font-handwriting mb-2'>Posts</h1>
      <hr className='my-4 opacity-25'/>
      <Style.PostsMenu>
        <div className='flex flex-row gap-4 my-4'>
          <Style.PostsTypeButton onClick={() => setSelectedPosts(articles)}>Articles</Style.PostsTypeButton>
          <Style.PostsTypeButton onClick={() => setSelectedPosts(poems)}>Poems (in Polish)</Style.PostsTypeButton>
        </div>
        <Style.PostsSearch type="text" placeholder="Search" />
      </Style.PostsMenu>
      <hr className='my-4 opacity-25'/>
      <Style.PostsWrapper>
        {
          selectedPosts.map((post) => (
            <Style.PostCard
              key={post.slug}
              className='doodle-border cursor-pointer'
              onMouseEnter={(e) => {
                e.currentTarget.classList.add('floating');
              }}
              onClick={() => {
                window.location.href = `/posts/${post.slug}` || '/';
              }}
              >
              {
                post.data.image ?
                  <Style.PostCardThumbnail
                    src={`/assets/thumbnails/${post.data.image.thumbnail}.svg`}
                    alt={`Thumbnail for ${post.data.title}`}
                  /> :
                  null
              }
              <h2 className='font-bold text-3xl mb-2 font-handwriting truncate'>{post.data.title}</h2>
              {
                post.data.description ?
                  <>
                    <hr className='mb-2'/>
                    <p className='font-body text-sm text-justify'>{
                      post.data.description.slice(0, 256).concat('...')
                    }</p>
                  </> :
                  null
              }
            </Style.PostCard>
          ))
        }
      </Style.PostsWrapper>
    </div>
  )
};

export default PostsViewer;
