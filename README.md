# My personal site

This repository is divided into **three** functional branches:

1. The `main` branch holds the actual source code of my website,
   written mostly in TypeScript language, using Gatsby as my SSG.
2. Static sites generated by Gatsby are pushed into `gh-pages` branch
   and "automagically" published via GitHub Pages service.

## Main functionalities of this site

As said previously, all subpaths are static pages generated
by Gatsby using `md` and `mdx` Markdown files
(Yes! This functionality is also enabled, so cool,
custom React components can be used).

These sites can be divided into two categories: projects and blog posts.
In general, each Markdown file begins with a frontmatter
that hold the basic metadata of each site. Then the actual text body begins.

Assets used over these pages are kept in the `assets` directory.
The main subfolder here is the `images` one, that contains:

- `galleries` used during generation of project pages
- `techs`, where icons/logos SVGs of popular services
  or programming libraries are kept, also used during creation
  of aforementioned pages
- `thumbnails/posts` and `thumbnails/projects` where,
  as name suggests, thumbnails of blog posts and projects are kept,
  which are presented in their respective "table of contents" pages
- `cogs` that are ... SVGs of small cogs that spin
  around in the background of each page (see `MovingCogs` component)
- other miscellaneous pictures that are used
  in specific places like my photos etc.

Blog posts are actually pretty simple in terms of how their are structured.
Each post **MUST** contain information about their **`title`, `date`,
`tags` and the name of the post `thumbnail`** correlating to name
of the **file kept in the site `assets/thumbnails/posts`** folder.
If **no thumbnail** is to be used, **`none`** keyword
has to be used to make **GraphQL backend** happy and not throw
any exceptions when making queries to the database.
**After the frontmatter**, the post **content starts** in its Markdown glory.

Project pages are slightly a different breed.
Each of them is divided into **three subsections**:
project **hero section**, **`mdx` file** content and
**optional Readme** section. The **hero section** contains main
**pictures presented in a gallery**-esque manner and its **title**,
concise **abstract** and a minimal presentation of **tech stack** used
and a link to the project repo.

The project `mdx` **frontmatter** includes the information mentioned
in the posts description, **but** also **HAVE** to contain the following fields:

1. `gallery` which contains the name to the
   **project `assets/images/galleries/` folder with images**
   presented beside the main thumbnail
2. `techs` **whitespace separated list of technologies** used in the project.
   These **labels** are then used to look **for their corresponding SVGs**
   in the `assets/images/techs` folder. In other words,
   results of **GraphQL query for these files is filtered**
   to pluck out entries matching elements in the `techs` list.
   **So you write `python` and the Python official logo shows up**
   in the projects hero section.
   Pretty **cool** and (most importantly) **automatic**.
3. `abstract` that is a quick description of the project
4. `link` to **project repository** or a place where it is hosted
   e.g. Vercel/Heroku deployment
5. `readme` that is a link to the **project Readme.md** file that can be loaded
   after reading the first body text section of the page
   (via **Load Readme.md button**).
   If **no readme** is to be specified, the **`none`** keyword is to be used.
   In that case, the button won't show up to not confuse the user.

So, a lot of data, but the main payoff is that
**everything then is automatically put into a predefined layout**.
This saves **a lot of time**, because it eliminates the need
to manually write JSX page-like components for each project/blog post.

Layouts mean styled content. Styled content means that CSS was used.
But its 2022 (or at least that is the year when this Readme is written).
It is time to ditch pure CSS (or even Sass) and embrace styling libraries.
The two main contenders in case of this site were:
**`styled-components` and TailwindCSS framework**.
Both of them allow for dynamic generation of styles inside components source code
and eliminate the need for additional files
to be created (namely `.css` and `.scss` sheets).

Styled components is cool because it allows to define styled React components
in an intuitive manner **and** its parser understands **Sass** syntax,
so its magic can be used. Tailwind is fast and concise. But what if there was a way
to combine both of them? Welcome the awesome
[library](https://github.com/MathiasGilson/tailwind-styled-component)
by Mathias Gilson that does just that.
I've decided to use that for nice separation of styling code
(just like in case of pure `styled-components` lib) i.e.
**make the JSX portions of components cleaner**.
If more advanced CSS is to be used, vanilla `styled-components`
can be thrown instead of `tailwind-styled-components` import. Win-win.

Actual **static pages**, like posts/project "table of contents" ones,
are kept in the **`src/pages` directory**. These are basically constant (non-generated)
endpoints used by Gatsby to create their corresponding subpaths
i.e. they are guaranteed to always exists in my website index.

**Color and fonts theme** is defined in
**`style/theme.js` file that is imported into `tailwind.config.js`**
config situated in the repo root.
**Fonts are imported in the `style/global.css`** stylesheet,
which is then used by TailwindCSS.

## Code base organization

This **source code of this repo** (sitting under `src/` directory)
is organized in a way **very similar to conventional React projects**.
All React **components**, which could be easily
**separated into autonomous entities** with their delegated functionalities,
are kept **in `components` folder**. Each **component has its own subdirectory**
with two TypeScript files: `index.ts` import stub file
and the actual component source code `tsx` file.
This is done for their **easier-to-read (and write/use) imports** in other parts
of the code base e.g. `@components/Component`
instead of `./components/Component/Component.tsx`.

The filepath `@` aliases are set up in the `gatsby-config.js` file
using `gatsby-plugin-alias-imports` library. This also **significantly** shortens
import statements, so they are more digestible.

**Layouts** for Gatsby, used during aforementioned **generation of pages**,
are kept inside **`src/layouts` folder**.
That's really it, you can **see `gatsby-node.js` script for details**.

**Markdown files** used during generation of project
and blog entries are kept under their **corresponding subdirectory of `content` path**.

## Wait, Figma is listed in the tech stack. What's about that?

Yeah, **for my first version of this website I've used Figma** to
establish its general look and feel like color palette
(or at least the **high contrast style**)
and **how the UI is to be structured**.

You can view my
[Figma draft](https://www.figma.com/file/f5Z3eLkflxV8P5eSVWBfiP/Strona?node-id=0%3A1)
if You want, but it is **nowhere near an official presentation worthy state**.
In this case, it was more like an virtual whiteboard
than a professionally created site mockup.

## End word

**Feel free to use the template** located in my repos.
If You want to change how the posts frontmatter is structured
or limit/extend the types of generated sites,
**be sure to modify** `gatsby-node.js` file accordingly.

Thanks for reading though this Readme and have a nice day!
