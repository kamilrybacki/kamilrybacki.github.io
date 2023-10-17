import { bamboozle as _ } from "@utils/logic";
import * as React from "react";

interface PostsViewerProps {
  articles: any[];
  poems: any[];
}

const hiddenPosts = ["cheatsheet"];

const PostsViewer = ({ articles, poems }: PostsViewerProps) => {
  const [selectedPosts, setSelectedPosts] = React.useState(articles);
  return (
    <div className="posts-viewer w-full">
      <nav className="mt-2 flex w-full flex-row justify-between">
        <h1 className="mb-2 font-handwriting text-4xl lg:text-9xl">Posts</h1>
        <button className="mt-auto h-fit p-1 hover:translate-y-2 lg:p-2 lg:hover:translate-x-2">
          <a href="/projects" className="font-handwriting font-bold">
            Go to projects
          </a>
        </button>
      </nav>
      <hr className="mb-4 mt-3 w-full opacity-25 lg:my-6" />
      <nav className="mb-6 flex flex-col items-center justify-between lg:flex-row">
        <div className="my-2 flex flex-row justify-center gap-4 lg:my-2 lg:justify-start">
          <button
            className="p-1 font-handwriting font-bold transition-all duration-200 focus:translate-y-2"
            onClick={() => setSelectedPosts(articles)}
          >
            Articles
          </button>
          <button
            className="p-1 font-abstract font-bold transition-all duration-200 hover:font-handwriting focus:translate-y-2 focus:font-handwriting"
            onClick={() => setSelectedPosts(poems)}
          >
            Poems (in Polish)
          </button>
        </div>
      </nav>
      <hr className="my-4 opacity-25" />
      <div className="relative mt-8 flex flex-col items-center gap-2 lg:flex-row lg:flex-wrap lg:gap-4">
        {selectedPosts.map((post) => {
          if (post.slug[0] !== "_" && !hiddenPosts.includes(post.slug)) {
            return (
              <article
                className="doodle-border mb-4 w-[300px] cursor-pointer bg-background px-6 py-4 duration-500 hover:-translate-y-2 lg:h-[400px] lg:w-[500px]"
                key={post.slug}
                onClick={() => {
                  window.location.href = `/posts/${post.slug}` || "/";
                }}
              >
                {post.data.image ? (
                  <img
                    className="mx-auto mb-4 max-h-[150px] w-[200px] rounded-lg grayscale invert lg:max-h-[200px] lg:w-[350px]"
                    src={`/assets/thumbnails/${post.data.image.thumbnail}.svg`}
                    alt={`Thumbnail for ${post.data.title}`}
                  />
                ) : null}
                <h2 className="mb-2 truncate font-handwriting text-3xl font-bold">{post.data.title}</h2>
                {post.data.description ? (
                  <>
                    <hr className="mb-2" />
                    <p className="text-justify font-body text-sm">
                      {post.data.description.slice(0, 256).concat("...")}
                    </p>
                  </>
                ) : null}
              </article>
            );
          } else if (hiddenPosts.includes(post.slug)) {
            _(post.slug, post.data.title.length);
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default PostsViewer;
