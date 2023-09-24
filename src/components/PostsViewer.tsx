import * as React from "react";

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
            <hr className="mb-4 mt-3 w-full opacity-25 lg:mb-10 lg:mt-6" />
            <nav className="mb-4 flex flex-col items-center justify-between lg:flex-row">
                <div className="my-2 flex flex-row justify-center gap-4 lg:my-4 lg:justify-start">
                    <button
                        className="p-1 font-handwriting font-bold transition-all duration-500 hover:translate-y-2"
                        onClick={() => setSelectedPosts(articles)}
                    >
                        Articles
                    </button>
                    <button
                        className="p-1 font-handwriting font-bold transition-all duration-500 hover:translate-y-2"
                        onClick={() => setSelectedPosts(poems)}
                    >
                        Poems (in Polish)
                    </button>
                </div>
                {/* <Style.PostsSearch type="text" placeholder="Search" /> */}
            </nav>
            <hr className="my-4 opacity-25" />
            <div className="mt-8 flex flex-col items-center justify-between lg:flex-row lg:flex-wrap">
                {selectedPosts.map((post) => (
                    <article
                        className="doodle-border mb-4 w-[300px] cursor-pointer bg-background px-6  py-4 lg:w-[500px]"
                        key={post.slug}
                        onMouseEnter={(e) => {
                            e.currentTarget.classList.add("floating");
                        }}
                        onClick={() => {
                            window.location.href = `/posts/${post.slug}` || "/";
                        }}
                    >
                        {post.data.image ? (
                            <img
                                className="mx-auto mb-4 max-h-[150px] w-[200px] rounded-lg lg:max-h-[200px] lg:w-[350px]"
                                src={`assets/thumbnails/${post.data.image.thumbnail}.svg`}
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
                ))}
            </div>
        </div>
    );
};

export default PostsViewer;
