# Custom Markdown components

This directory contains custom components for Markdown (MDX) files.

**Note**: Whenever a **multiline string** is to be passed as a prop, the string **must be enclosed in curly brackets and backticks** to avoid issues with the MDX parser. This prevents problems with indentations and newlines.

## Components

### CurseWord

A component that renders a curse word with a "spoiler-like" effect.

#### Props

- `word` (`string`): The curse word to render.

The format of `word` is `n:word:m` where `n` is the number of starting characters to show, `word` is the curse word, and `m` is the number of ending characters to show.

#### Example

```jsx
<CurseWord word="2:fiddling:2"/>
```

### FileTree

A component that renders a file tree, using a mock up terminal window, with annotations shown beside and ability to add external links to chosen files.

#### Props

- `root` (`string`): The root directory of the file tree.
- `tree` (`Array<string | FileTreeEntry>`): The file tree to render.
- (*optional*) `annotations` (`string`): The annotations to show beside the file tree. (default: `""`)
- (*optional*) `links` (`string`): The external links to show beside the file tree. (default: `""`)

The `tree` parameter is an array of strings and / or `FileTreeEntry` type objects:

```ts
type FileTreeEntry = string | {
  [key: string]: Array<FileTreeEntry>
}
```

Strings represent files, and objects represent directories. The keys of the objects are the names of the directories, and the values are arrays of strings and objects, representing the files and subdirectories of the directory.

The `annotations` and `links` parameters are multiline strings, where each line is of the format `file:annotation` or `file:URL`, respectively.

#### Example

```jsx
<FileTree
  root="home"
  tree={[
    "file1",
    {
      "dir1": [
        "file2",
        "file3"
      ]
    }
  ]}
  annotations={`
    file1:This is my file
  `}
  links={`
    file2:https://gist.github.com/jwilber/d02e4381d776fb9a7bcb126d3b32c85b
  `}
/>
```

### `ScribbleGraph`

A component that renders a graph using the [`roughViz`] library, which is bascially a wrapper / factory-like component, that produces different types of graphs using the same set of props.

#### Props

- `type` (`string`): The type of graph to render.
- `data` (`Object`): The data to render, corresponding to the type of graph from `roughViz` library.
- `height` (`number`): The height of the graph.
- `title` (`string`): The title of the graph.
- `caption` (`string`): The caption of the graph.
- `options` (`Object`): The options of the graph, corresponding to parameters specific to the type of graph from `roughViz` library.
- (*optional*) `width` (`number`): The width of the graph (default: 100% of viewport width).

For explainations of different types of graphs, see the `roughViz` [README] for appropiate combinations of `type`, `data`, and `options` parameters.

#### Example

For this component, the appropiate `import` statement and `client:load` prop is required to be added to the component.

```jsx
import ScribbleGraph from "@components/markdown/ScribbleGraph"

<ScribbleGraph
  type="scatter"
  data={{
    x: [1, 2, 3, 4],
    y: [10, 15, 13, 17],
  }}
  height={500}
  title="Test"
  caption="Test"
  options={{}}
  width={500}
  client:load
/>
```

### `CodeSnippet`

A wrapper component that renders a code snippet, using the `Code` component from `astro:components` library, with possibility to add single- or multiline comments.

#### Props

- `code` (`string`): The code to render, passed as a multiline string. **Do not** use double-quotes (`"`) in the code, as it will cause issues with the MDX parser.
- `language` (`string`): The language of the code to render, corresponding to one of language-tags used normally within Markdown code blocks.
- `filename` (`string`): The filename of the code to render.
- (*optional*) `annotations` (`string`): Multiline string containing single- and multiline comments to render. (default: `""`)

The `annotations` parameter is a multiline string, where each line is of the either `n-m:comment` or `n:comment` format, where `n` is the starting line number (or just a line number for single-line comments), `m` is the ending line number, and `comment` is the comment text to render.

#### Example

```jsx
<CodeSnippet
  code={`
    import locale
    from functools import cmp_to_key

    def sort_list(list):
      list.sort() 
      return sorted(my_list, key=len)

    my_list = ['blue', 'red', 'green']
    print(sort_list)
  `}
  language="python"
  filename="script.py"
  annotations={`
    3-7:Function
  `}
/>
```

### `JupyterLiteEmbed`

A component that embeds a rendered Jupyter notebook via externally hosted JupyterLite instance on Vercel.

#### Props

- `size` (`string`): The size of the embedded notebook.
- `file` (`string`): The file path of the notebook to render (relative to the `src/content/_jupyter` directory).
- `kernel` (`string`): The kernel to use to render the notebook.

#### Example

For this component, the appropiate `import` statement and `client:load` prop is required to be added to the component.

```jsx
import JupyterLiteEmbed from "@components/markdown/JupyterLiteEmbed"

<JupyterLiteEmbed
  size="500px"
  file="lorenz/Lorenz.ipynb"
  kernel="python"
  client:load
/>
```

### `CodePenEmbed`

A component that embeds a CodePen snippet with additional console capturing hook, using the `postMessage` API for communication between the CodePen IFrame embed and the host page.

To utilize this hook, either `html` or `js` code blocks (if both are present, `html` takes precedence) is automatically prepended with the following code (either as a `script` tag or a fenced code block):

```js
window.console = {
  log: function(message) {
    window.top.postMessage({ 
      from: ..., // Here the title of the CodePen ID is used
      message: message
    }, '*');
  }
}
```

It is important to **not** modify this code.

#### Props

- `blocks` (`Object`): The code blocks of the CodePen snippet, corresponding to the [source code types (types of `pre` tags) of the CodePen snippets]. Each block must be passed as a multiline string.
- `size` (`number`): The height of the CodePen snippet.
- (*optional*) `options` (`Object`): The options of the CodePen snippet, corresponding to the [options of the CodePen embed]. (default: `{}`)
- (*optional*) `title` (`string`): The title of the CodePen snippet. (default: `""`)
- (*optional*) `description` (`string`): The description of the CodePen snippet. (default: `""`)
- (*optional*) `tags` (`Array<string>`): The tags of the CodePen snippet. (default: `[]`)

#### Example

For this component, the appropiate `import` statement and `client:load` prop is required to be added to the component.

```jsx
<CodePenEmbed
  blocks={{
    "html": `
      <div>
        <h1>Hello World</h1>
        <p>lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat</p>
      </div>
    `,
    "css": `
      p { color: red; }
    `,
    "js": `
      for (let i = 0; i < 100; i++) {
        console.log(i);
      }
    `
  }}
  options={{
    "themeId": "dark",
    "editable": true,
    "height": "500",
    "defaultTab": "html,result"
  }}
  size={500}
  title="Test"
  description="Test CodePenEmbed"
  tags={["cool"]}
/>
```

[`roughViz`]: https://github.com/jwilber/roughViz
[README]: https://github.com/jwilber/roughViz/blob/master/README.md
[source code types (types of `pre` tags) of the CodePen snippets]: https://blog.codepen.io/documentation/prefill-embeds/
[options of the CodePen embed]: https://blog.codepen.io/documentation/prefill-embeds/#what-goes-on-the-wrapper-element
