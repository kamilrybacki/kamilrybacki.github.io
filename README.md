# Kamil Rybacki - Personal Blog

Ultra-lightweight personal blog built with [11ty (Eleventy)](https://www.11ty.dev/) featuring a typewriter aesthetic and modular CSS architecture.

## 🚀 Features

- **Ultra-lightweight**: Minimal dependencies, fast loading
- **Typewriter Design**: Clean, professional document-style aesthetic  
- **Modular CSS**: Organized, maintainable stylesheet architecture
- **Responsive**: Mobile-first design with optimized typography
- **Dark Code Blocks**: Professional syntax highlighting
- **Auto-deployment**: CI/CD pipeline for GitHub Pages

## 🛠️ Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Clean build directory
npm run clean
```text

## 📂 Project Structure

```
├── src/
│   ├── _layouts/           # Page layouts
│   ├── content/            # Articles and projects
│   ├── pages/              # Static pages
│   └── styles/             # Modular CSS
│       ├── tokens/         # Design variables
│       ├── base/           # Reset & typography
│       ├── layout/         # Container & responsive
│       └── components/     # UI components
├── public/                 # Static assets
└── .github/workflows/      # CI/CD automation
```

## 🚀 Deployment

This site automatically deploys to GitHub Pages when changes are pushed to the `main` branch.

### Manual Deployment

1. Ensure you're on the `main` branch
2. Push your changes: `git push origin main`
3. GitHub Actions will automatically build and deploy

### GitHub Pages Setup

1. Go to repository **Settings** → **Pages**
2. Set **Source** to "GitHub Actions"
3. The site will be available at `https://kamilrybacki.github.io`

## 🎨 CSS Architecture

The project uses a modular CSS architecture for better maintainability:

- **Variables** (`tokens/`): Design system tokens
- **Base** (`base/`): Reset, typography, base elements
- **Layout** (`layout/`): Container utilities and responsive design
- **Components** (`components/`): Discrete UI components

## 📝 Content Management

### Adding Articles

1. Create a new `.md` file in `src/content/articles/`
2. Add frontmatter with title, date, and description
3. Write your content in Markdown

### Adding Projects

1. Create a new `.md` file in `src/content/projects/`
2. Include GitHub and demo links in frontmatter
3. Add project description

## 🏗️ Built With

- **[11ty](https://11ty.dev)** - Static site generator
- **[Prism.js](https://prismjs.com/)** - Syntax highlighting
- **CSS Grid & Flexbox** - Modern layout
- **GitHub Actions** - CI/CD pipeline

## 📄 Legacy MDX Snippet Migration

Earlier MDX articles used custom components like `<CodeSnippet>`, `<FileTree>`, and embedded notebook widgets. Those sources are no longer in the repository; placeholders in the migrated Markdown (`reflections.md`, `containerized-integration.md`, `comfortable-rustification.md`) have been replaced with reconstructed, representative code blocks and ASCII file trees. If you later recover the original MDX, you can overwrite the reconstructed blocks with the authoritative code.

---

**Live Site**: [https://kamilrybacki.github.io](https://kamilrybacki.github.io)
