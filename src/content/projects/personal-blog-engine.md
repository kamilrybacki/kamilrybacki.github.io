---
title: "Personal Blog Engine"
description: "Ultra-lightweight static site generator built with 11ty and hand-drawn aesthetic design"
tech: ["11ty", "JavaScript", "CSS", "Nunjucks", "Paint API"]
github: "https://github.com/yourusername/blog-engine"
demo: "https://your-blog-site.com"
year: 2025
featured: true
---

A complete rebuild of my personal blog using 11ty (Eleventy) for maximum performance and minimal complexity. This project prioritizes speed, accessibility, and unique visual design.

## Key Features

- **Ultra-lightweight**: 11ty generates blazing-fast static sites with minimal JavaScript
- **Hand-drawn aesthetic**: Custom CSS Paint Worklet creates organic, sketchy borders
- **Fully responsive**: Mobile-first design with comprehensive breakpoints
- **Developer-friendly**: Markdown-driven content with automatic syntax highlighting
- **Performance-optimized**: Minimal dependencies and efficient asset loading

## Technical Implementation

### Paint API Integration

The hand-drawn border effect uses the CSS Paint API with progressive enhancement:

```javascript
// drawn-line-worklet.js
class DrawnLineWorklet {
  paint(ctx, geom, properties) {
    const variation = 2;
    ctx.strokeStyle = '#6e9075';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.moveTo(variation, variation);
    
    // Create organic, hand-drawn lines
    for (let i = 0; i <= geom.width; i += 10) {
      const wobble = (Math.random() - 0.5) * variation;
      ctx.lineTo(i + wobble, variation + wobble);
    }
    
    ctx.stroke();
  }
}

registerPaint('drawn-line', DrawnLineWorklet);
```

### 11ty Configuration

Streamlined build process with essential plugins only:

```javascript
module.exports = function(eleventyConfig) {
  // Collections for content organization
  eleventyConfig.addCollection("articles", collection => {
    return collection.getFilteredByGlob("src/content/articles/*.md")
      .sort((a, b) => b.date - a.date);
  });

  // Syntax highlighting for code blocks
  eleventyConfig.addPlugin(syntaxHighlight);
  
  // Responsive image processing
  eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);
  
  return {
    dir: {
      input: "src",
      output: "dist",
      layouts: "_layouts"
    }
  };
};
```

## Performance Metrics

Lighthouse scores consistently hit 95+ across all categories:

- **Performance**: 98/100
- **Accessibility**: 100/100  
- **Best Practices**: 100/100
- **SEO**: 100/100

Build times are extremely fast:
- Initial build: ~200ms
- Incremental builds: ~50ms
- 50+ articles and projects

## Design Philosophy

The visual design balances professionalism with personality through:

- **Organic shapes**: Hand-drawn borders and irregular geometry
- **Thoughtful typography**: Clear hierarchy with readable font choices
- **Restrained color palette**: Mint cream, charcoal, and sage green
- **Generous whitespace**: Content breathing room enhances readability

## Content Management

Articles and projects are written in Markdown with YAML frontmatter:

```markdown
---
title: "Article Title"
date: 2025-01-15
description: "Brief description for SEO and previews"
tags: ["tech", "design", "performance"]
featured: true
---

Content here with full Markdown support including:
- Code syntax highlighting
- Tables and lists
- Image optimization
- Custom components
```

## Deployment Strategy

Optimized for static hosting with automatic builds:

- **Hosting**: Netlify with edge CDN
- **CI/CD**: GitHub Actions for build automation
- **Asset optimization**: Automatic image compression and WebP conversion
- **Cache strategy**: Long-term caching with content hashing

## Future Enhancements

Planned improvements while maintaining lightweight philosophy:

- **Search functionality**: Client-side search with Lunr.js
- **Reading analytics**: Privacy-focused view tracking
- **Comment system**: Lightweight integration with GitHub Issues
- **RSS feeds**: Automatic feed generation for articles

This project demonstrates that modern web development doesn't require heavy frameworks to achieve excellent results. Sometimes the best solution is the simplest one.