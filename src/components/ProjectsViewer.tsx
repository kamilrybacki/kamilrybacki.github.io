import * as React from "react";

interface ProjectsViewerProps {
  projects: any[];
}

const ProjectsViewer = ({ projects }: ProjectsViewerProps) => {
  return (
    <div className="projects-viewer w-full">
      <nav className="mt-2 flex w-full flex-row justify-between">
        <p className="mb-2 font-handwriting text-4xl lg:text-9xl">Projects</p>
        <button className="mt-auto h-fit p-1 hover:translate-y-2 lg:p-2 lg:hover:translate-x-2">
          <a href="/posts" className="font-handwriting font-bold">
            Go to blog
          </a>
        </button>
      </nav>
      <hr className="mb-4 mt-3 w-full opacity-25 lg:mb-10 lg:mt-6" />
      <main className="flex w-full flex-col items-center justify-center gap-4 lg:flex-row lg:gap-10">
        {projects.map((project) => {
          return (
            <article
              className="project-card doodle-border flex w-[95%] cursor-pointer flex-col flex-wrap items-center justify-center p-2 duration-500 hover:-translate-y-2 lg:w-[40%] lg:p-4"
              onClick={() => {
                window.location.href = `/projects/${project.slug}` || "/";
              }}
              key={project.slug}
            >
              <h1 className="mx-auto mb-4 mt-2 text-center font-handwriting text-2xl font-bold lg:mb-4 lg:mt-2 lg:text-5xl">
                {project.data.title}
              </h1>
              <p className="mt-4 text-justify font-body text-sm lg:mt-2 lg:text-base">{project.data.description}</p>
            </article>
          );
        })}
      </main>
    </div>
  );
};

export default ProjectsViewer;
