/**
 * Article Filtering & Fade-in Animation
 * Provides client-side filtering for articles by category
 * and IntersectionObserver-based fade-in animations
 */

(function() {
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

  function initializeFilters() {
    var filterButtons = document.querySelectorAll('.filter-btn');
    var articleItems = document.querySelectorAll('.article-item');

    if (filterButtons.length === 0 || articleItems.length === 0) {
      return;
    }

    filterButtons.forEach(function(button) {
      button.addEventListener('click', function() {
        var filter = this.getAttribute('data-filter');
        filterArticles(filter);
        updateActiveButton(this);
      });
    });
  }

  function filterArticles(filter) {
    var articleItems = document.querySelectorAll('.article-item');
    var noResultsMessage = document.querySelector('.no-articles-message');
    var visibleCount = 0;

    articleItems.forEach(function(item) {
      var category = item.getAttribute('data-category');
      var match = (filter === 'all') || (category === filter);
      if (match) {
        item.classList.remove('filtered-out');
        item.style.display = '';
        visibleCount++;
      } else {
        item.classList.add('filtered-out');
        item.style.display = 'none';
      }
    });

    if (noResultsMessage) {
      var showEmpty = (visibleCount === 0 && filter !== 'all');
      noResultsMessage.style.display = showEmpty ? 'block' : 'none';
    }
  }

  function updateActiveButton(activeButton) {
    var filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(function(button) {
      button.classList.remove('active');
    });
    activeButton.classList.add('active');
  }

  function initializeFadeIn() {
    var articleItems = document.querySelectorAll('.article-item');
    if (articleItems.length === 0) return;

    if (!('IntersectionObserver' in window)) {
      articleItems.forEach(function(item) {
        item.classList.add('visible');
      });
      return;
    }

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    articleItems.forEach(function(item, index) {
      item.style.transitionDelay = (index * 80) + 'ms';
      observer.observe(item);
    });
  }

  // Keyboard support for filter buttons
  document.addEventListener('keydown', function(e) {
    if (e.target.classList.contains('filter-btn')) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.target.click();
      }
    }
  });

})();
