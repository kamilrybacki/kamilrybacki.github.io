import * as React from 'react';

import '@styles/floating.css';

interface PostsViewerProps {
  articles: any[];
  poems: any[];
}

// export const PostsSearch = tw.input`
//   font-body
//   py-1
//   px-2
//   w-1/3
// `;

const PostsViewer = ({articles, poems}: PostsViewerProps) => {
  const [selectedPosts, setSelectedPosts] = React.useState(articles);

  return (
    <div className="posts-viewer w-full">
      <nav className='flex flex-row justify-between w-full mt-2'>
        <h1 className='text-4xl lg:text-9xl font-handwriting mb-2'>Posts</h1>
        <button className='p-1 lg:p-2 h-fit mt-auto hover:translate-y-2 lg:hover:translate-x-2'>
          <a href='/projects' className='font-bold font-handwriting'>
            Go to projects
          </a>
        </button>
      </nav>
      <hr className='mb-4 lg:mb-10 mt-3 lg:mt-6 opacity-25 w-full'/>
      <nav className='flex flex-col lg:flex-row justify-between items-center mb-4'>
        <div className='flex flex-row justify-center lg:justify-start gap-4 my-2 lg:my-4'>
          <button 
            className='font-handwriting font-bold p-1 hover:translate-y-2 transition-all duration-500'
            onClick={() => setSelectedPosts(articles)}
          >
            Articles
          </button>
          <button 
            className='font-handwriting font-bold p-1 hover:translate-y-2 transition-all duration-500'
            onClick={() => setSelectedPosts(poems)}
          >
            Poems (in Polish)
          </button>
        </div>
        {/* <Style.PostsSearch type="text" placeholder="Search" /> */}
      </nav>
      <hr className='my-4 opacity-25'/>
      <div className='flex flex-col lg:flex-row lg:flex-wrap justify-between items-center mt-8'>
        {
          selectedPosts.map((post) => (
            <article 
              className='doodle-border cursor-pointer bg-background py-4 px-6 mb-4  w-[300px] lg:w-[500px]'
              key={post.slug}
              onMouseEnter={(e) => {
                e.currentTarget.classList.add('floating');
              }}
              onClick={() => {
                window.location.href = `/posts/${post.slug}` || '/';
              }}
            >
              {
                post.data.image ?
                  <img
                    className='w-[200px] lg:w-[350px] max-h-[150px] lg:max-h-[200px] rounded-lg mb-4 mx-auto'
                    src={
                      `assets/thumbnails/${post.data.image.thumbnail}.svg`
                  }
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
            </article>
          ))
        }
      </div>
    </div>
  )
};

export default PostsViewer;
