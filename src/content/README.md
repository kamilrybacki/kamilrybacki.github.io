# Content Templates

This directory contains template files for creating new articles and projects.

## How to Use

### Creating a New Article

1. Copy the article template:

   ```bash
   cp src/content/articles/_template.md src/content/articles/your-article-name.md
   ```

2. Edit the frontmatter:
   - Update `title` with your article title
   - Set the `date` to today's date (YYYY-MM-DD format)
   - Write a compelling `description` for SEO and previews
   - Add relevant `tags` as an array
   - Set `draft: false` when ready to publish

3. Replace the template content with your article

### Creating a New Project

1. Copy the project template:

   ```bash
   cp src/content/projects/_template.md src/content/projects/your-project-name.md
   ```

2. Edit the frontmatter:
   - Update `title` with your project name
   - Set the `date` to project completion/start date
   - Write a clear `description`
   - List `technologies` used
   - Add `github` and `demo` URLs if available
   - Set `status`: "completed", "in-progress", or "planned"
   - Set `featured: true` for highlighted projects

3. Replace the template content with your project details

## File Naming

- Use lowercase letters and hyphens for file names
- Be descriptive but concise
- Examples:
  - `building-ultra-lightweight-blogs.md`
  - `minimalist-css-framework.md`
  - `terminal-based-productivity-tools.md`

## Tips

- Templates use Nunjucks syntax (e.g., `{{ title }}`) - these get replaced during build
- The `_template.md` files won't be built into pages (they start with underscore)
- Test locally with `npm run dev` before publishing
- Check for markdown linting issues in VS Code