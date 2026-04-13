/**
 * Article Filtering & Fade-in Animation
 * Category filter: text input with autosuggestions after 2 characters.
 * Suggestions appear below the input; selecting one snaps the filter.
 * Clearing the input restores all articles.
 */

(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

  function initialize() {
    initializeFilters();
    initializeFadeIn();
  }

  // ─── Filter ──────────────────────────────────────────────────────────────

  function initializeFilters() {
    var input       = document.querySelector('.filter-input');
    var suggestions = document.querySelector('.filter-suggestions');
    var articleItems = document.querySelectorAll('.article-item');

    if (!input || articleItems.length === 0) return;

    var suggestionItems = suggestions
      ? Array.from(suggestions.querySelectorAll('.filter-suggestion-item'))
      : [];

    // ── helpers ──

    function filterArticles(query) {
      var lq = query.trim().toLowerCase();
      var count = 0;
      articleItems.forEach(function (article) {
        var cat = (article.getAttribute('data-category') || '').toLowerCase();
        var match = !lq || cat.indexOf(lq) !== -1;
        if (match) {
          article.classList.remove('filtered-out');
          article.style.display = '';
          count++;
        } else {
          article.classList.add('filtered-out');
          article.style.display = 'none';
        }
      });
      var noResults = document.querySelector('.no-articles-message');
      if (noResults) {
        noResults.style.display = (count === 0) ? 'block' : 'none';
      }
    }

    function openSuggestions(query) {
      if (!suggestions || query.trim().length < 2) {
        closeSuggestions();
        return;
      }
      var lq = query.trim().toLowerCase();
      var matched = 0;
      suggestionItems.forEach(function (item) {
        var cat = (item.getAttribute('data-category') || '').toLowerCase();
        var visible = cat.indexOf(lq) !== -1;
        item.style.display = visible ? '' : 'none';
        if (visible) matched++;
      });
      if (matched > 0) {
        suggestions.hidden = false;
        input.setAttribute('aria-expanded', 'true');
      } else {
        closeSuggestions();
      }
    }

    function closeSuggestions() {
      if (!suggestions) return;
      suggestions.hidden = true;
      input.setAttribute('aria-expanded', 'false');
    }

    function pickSuggestion(item) {
      input.value = item.getAttribute('data-category');
      filterArticles(input.value);
      closeSuggestions();
      input.focus();
    }

    function visibleSuggestions() {
      return suggestionItems.filter(function (i) {
        return i.style.display !== 'none';
      });
    }

    // ── events: input ──

    input.addEventListener('input', function () {
      filterArticles(this.value);
      openSuggestions(this.value);
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeSuggestions();
        return;
      }
      if (e.key === 'ArrowDown' && !suggestions.hidden) {
        e.preventDefault();
        var vis = visibleSuggestions();
        if (vis.length) vis[0].focus();
      }
    });

    // Close on outside click / blur (delay so click fires first)
    input.addEventListener('blur', function () {
      setTimeout(closeSuggestions, 160);
    });

    // ── events: suggestions ──

    if (suggestions) {
      suggestions.addEventListener('click', function (e) {
        var item = e.target.closest('.filter-suggestion-item');
        if (item) pickSuggestion(item);
      });

      suggestions.addEventListener('keydown', function (e) {
        var focused = document.activeElement;
        if (!focused || !focused.classList.contains('filter-suggestion-item')) return;

        var vis = visibleSuggestions();
        var idx = vis.indexOf(focused);

        if (e.key === 'Enter') {
          e.preventDefault();
          pickSuggestion(focused);
        } else if (e.key === 'Escape') {
          closeSuggestions();
          input.focus();
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          var next = vis[idx + 1];
          if (next) next.focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (idx === 0) {
            input.focus();
          } else {
            var prev = vis[idx - 1];
            if (prev) prev.focus();
          }
        }
      });
    }
  }

  // ─── Fade-in ──────────────────────────────────────────────────────────────

  function initializeFadeIn() {
    var articleItems = document.querySelectorAll('.article-item');
    if (articleItems.length === 0) return;

    if (!('IntersectionObserver' in window)) {
      articleItems.forEach(function (item) { item.classList.add('visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    articleItems.forEach(function (item, index) {
      item.style.transitionDelay = (index * 80) + 'ms';
      observer.observe(item);
    });
  }

})();
