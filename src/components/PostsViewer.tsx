import * as React from "react";

interface PostsViewerProps {
    articles: any[];
    poems: any[];
}

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
            <hr className="mb-4 mt-3 w-full opacity-25 lg:mb-6 lg:mt-6" />
            <nav className="mb-6 flex flex-col items-center justify-between lg:flex-row">
                <div className="my-2 flex flex-row justify-center gap-4 lg:my-2 lg:justify-start">
                    <button
                        className="p-1 font-handwriting font-bold transition-all focus:translate-y-2 duration-200"
                        onClick={() => setSelectedPosts(articles)}
                    >
                        Articles
                    </button>
                    <button
                        className="p-1 font-bold transition-all focus:translate-y-2 font-abstract hover:font-handwriting focus:font-handwriting duration-200"
                        onClick={() => setSelectedPosts(poems)}
                    >
                        Poems (in Polish)
                    </button>
                </div>
            </nav>
            <hr className="my-4 opacity-25" />
            <div className="mt-8 flex flex-col items-center gap-2 lg:gap-4 lg:flex-row lg:flex-wrap">
                {selectedPosts.map((post) => {
                    if (post.slug[0] !== "_") {
                      return (
                        <article
                            className="doodle-border mb-4 w-[300px] cursor-pointer bg-background px-6 py-4 lg:w-[500px] duration-500 hover:-translate-y-2"
                            key={post.slug}
                            onClick={() => {
                                window.location.href = `/posts/${post.slug}` || "/";
                            }}
                        >
                            {post.data.image ? (
                                <img
                                    className="mx-auto mb-4 max-h-[150px] w-[200px] rounded-lg lg:max-h-[200px] lg:w-[350px] invert grayscale"
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
                      )
                    }
                    return null
                  })
                }
            </div>
        </div>
    );
};

export default PostsViewer;
