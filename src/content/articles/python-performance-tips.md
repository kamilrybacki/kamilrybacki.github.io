---
layout: article.njk
title: "Python Performance Tips"
date: 2025-10-05
description: "Essential Python optimization techniques for backend developers."
tags: ["python", "performance", "backend", "optimization"]
category: "IT"
draft: false
---

Python's reputation for being "slow" often stems from poor optimization choices rather than language limitations. Here are proven techniques to make your Python code faster and more efficient.

## Profiling First

Before optimizing anything, measure what's actually slow:

```python
import cProfile
import pstats

def profile_function(func):
    """Profile a function and show results"""
    profiler = cProfile.Profile()
    profiler.enable()
    result = func()
    profiler.disable()
    
    stats = pstats.Stats(profiler)
    stats.sort_stats('cumulative')
    stats.print_stats(10)  # Top 10 functions
    
    return result
```

Use line profilers for detailed analysis:

```bash
pip install line_profiler
kernprof -l -v your_script.py
```

## Data Structure Optimization

### Choose the Right Container

Different operations have different complexities:

| Operation | List | Dict | Set | Deque |
|-----------|------|------|-----|-------|
| Lookup | O(n) | O(1) | O(1) | O(n) |
| Insert at end | O(1) | O(1) | O(1) | O(1) |
| Insert at start | O(n) | N/A | N/A | O(1) |
| Delete | O(n) | O(1) | O(1) | O(1) |

### Use Built-in Functions

Built-ins are implemented in C and are much faster:

```python
# Slow - manual loop
total = 0
for item in data:
    total += item

# Fast - built-in function
total = sum(data)

# Slow - manual search
found = False
for item in data:
    if item == target:
        found = True
        break

# Fast - built-in membership test
found = target in data
```

## List Comprehensions vs Loops

List comprehensions are typically 2-3x faster than equivalent loops:

```python
# Slower - traditional loop
result = []
for x in range(1000):
    if x % 2 == 0:
        result.append(x * 2)

# Faster - list comprehension
result = [x * 2 for x in range(1000) if x % 2 == 0]

# Fastest - generator expression (if you don't need the full list)
result = (x * 2 for x in range(1000) if x % 2 == 0)
```

## Memory Optimization

### Use Slots for Classes

`__slots__` can reduce memory usage by 40-50%:

```python
class Point:
    __slots__ = ['x', 'y']
    
    def __init__(self, x, y):
        self.x = x
        self.y = y
```

### Generators for Large Datasets

Instead of loading everything into memory:

```python
# Memory intensive
def read_large_file(filename):
    with open(filename) as f:
        return f.readlines()

# Memory efficient
def read_large_file_generator(filename):
    with open(filename) as f:
        for line in f:
            yield line.strip()
```

## String Operations

### Use join() for String Concatenation

String concatenation in loops is extremely inefficient:

```python
# Slow - repeated string concatenation
result = ""
for item in items:
    result += str(item) + ", "

# Fast - join operation
result = ", ".join(str(item) for item in items)
```

### F-strings Are Fastest

For string formatting, f-strings win:

```python
name = "John"
age = 30

# Slowest
s = "Hello, " + name + "! You are " + str(age) + " years old."

# Faster
s = "Hello, {}! You are {} years old.".format(name, age)

# Fastest
s = f"Hello, {name}! You are {age} years old."
```

## Caching Strategies

### Function Caching

Use `lru_cache` for expensive function calls:

```python
from functools import lru_cache

@lru_cache(maxsize=128)
def expensive_function(n):
    # Simulate expensive computation
    return sum(i * i for i in range(n))
```

### Property Caching

Cache expensive property calculations:

```python
class DataProcessor:
    def __init__(self, data):
        self._data = data
        self._processed = None
    
    @property
    def processed_data(self):
        if self._processed is None:
            # Expensive processing here
            self._processed = self._process_data()
        return self._processed
```

## Async for I/O Operations

For I/O-bound operations, async can provide massive speedups:

```python
import asyncio
import aiohttp

async def fetch_url(session, url):
    async with session.get(url) as response:
        return await response.text()

async def fetch_multiple_urls(urls):
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_url(session, url) for url in urls]
        return await asyncio.gather(*tasks)
```

## NumPy for Numerical Operations

For numerical computations, NumPy is often 10-100x faster:

```python
import numpy as np

# Slow - pure Python
def python_sum_of_squares(data):
    return sum(x * x for x in data)

# Fast - NumPy
def numpy_sum_of_squares(data):
    arr = np.array(data)
    return np.sum(arr * arr)
```

## Database Optimization

### Use Connection Pooling

```python
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

engine = create_engine(
    'postgresql://user:pass@localhost/db',
    poolclass=QueuePool,
    pool_size=10,
    max_overflow=20
)
```

### Batch Operations

Instead of individual queries:

```python
# Slow - individual inserts
for item in items:
    cursor.execute("INSERT INTO table VALUES (%s, %s)", (item.a, item.b))

# Fast - batch insert
values = [(item.a, item.b) for item in items]
cursor.executemany("INSERT INTO table VALUES (%s, %s)", values)
```

## Key Takeaways

1. **Profile before optimizing** - measure, don't guess
2. **Use the right data structures** - understand time complexities
3. **Leverage built-ins** - they're optimized in C
4. **Consider memory usage** - especially for large datasets
5. **Use async for I/O** - don't block on network/disk operations
6. **Cache expensive operations** - avoid redundant calculations

> Remember: "Premature optimization is the root of all evil" - Donald Knuth

Focus on correctness first, then optimize the bottlenecks that actually matter to your application's performance.