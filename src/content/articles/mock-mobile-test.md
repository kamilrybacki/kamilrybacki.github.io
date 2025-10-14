---
layout: article.njk
title: Mobile Responsiveness Test Article
date: 2025-10-14
category: IT
description: A mock article containing varied elements to validate mobile layout, spacing, and readability.
---

# Designing for Small Screens

Ensuring a site feels native on mobile requires focusing on three core principles: **readability**, *tap comfort*, and performance. This mock article helps validate those aspects.

## Paragraph Flow

Body text should have a comfortable line length. On very small screens we reduce font-size slightly and adjust line-height. This paragraph intentionally runs a bit longer to visualize wrapping behavior. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi. Vivamus et eros vitae justo varius dictum.

## Lists

### Unordered

- Short item
- A longer list item that should wrap across lines nicely without awkward spacing
- Final item

### Ordered

1. First point
2. Second point that is also fairly long to test wrapping
3. Third point

## Code Samples

Inline code like `pip install something` should remain readable without forcing horizontal scroll.

```python
import time

def fibonacci(n: int) -> int:
    if n < 2:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

for i in range(10):
    print(i, fibonacci(i))
    time.sleep(0.05)
```

## Blockquote

> Simplicity is the soul of efficiency.

## Emphasis & Highlights

Use **strong emphasis** sparingly. Apply *italics* for subtle nuance. And sometimes a <span class="highlight">highlight</span> can draw the eye.

## Links

Check how a link like [Python.org](https://www.python.org) appears and behaves on hover / tap.

## Horizontal Rule

---

## Final Thoughts

If everything renders cleanly, spacing feels balanced, and the back button remains accessible without covering text, the mobile adjustments are successful.
