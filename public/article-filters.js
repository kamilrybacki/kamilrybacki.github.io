/**
 * Article Filtering Functionality
 * Provides client-side filtering for articles by category
 */

(function() {
  'use strict';

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFilters);
  } else {
    initializeFilters();
  }

  function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const articleItems = document.querySelectorAll('.article-item');

    if (filterButtons.length === 0 || articleItems.length === 0) {
      return; // No filters or articles found
    }

    // Add click event listeners to filter buttons
    filterButtons.forEach(button => {
      button.addEventListener('click', function() {
        const filter = this.getAttribute('data-filter');
        filterArticles(filter);
        updateActiveButton(this);
      });
    });

    // Initialize with all articles visible
    showAllArticles();
  }

  function filterArticles(filter) {
    const articleItems = document.querySelectorAll('.article-item');
    const noResultsMessage = document.querySelector('.no-articles-message');
    const listContainer = document.querySelector('.articles-container');
    let visibleCount = 0;

    // Add filtering class for smooth transition
    const articleList = document.querySelector('.article-list');
    if (articleList) {
      articleList.classList.add('filtering');
    }

    articleItems.forEach(item => {
      const category = item.getAttribute('data-category');
      const match = (filter === 'all') || (category === filter);
      if (match) {
        item.classList.remove('filtered-out');
        item.style.display = '';
        visibleCount++;
      } else {
        item.classList.add('filtered-out');
        item.style.display = 'none';
      }
    });

    // Show/hide no results message
    if (noResultsMessage) {
      const showEmpty = (visibleCount === 0 && filter !== 'all');
      noResultsMessage.classList.toggle('show', showEmpty);
      // If showing empty state ensure message block is visible (fallback if CSS missing)
      noResultsMessage.style.display = showEmpty ? 'block' : 'none';
    }

    // Update the view all articles link visibility
    updateViewAllLink(filter, visibleCount);
    
    // Remove filtering class after transition
    setTimeout(() => {
      if (articleList) {
        articleList.classList.remove('filtering');
      }
    }, 300);
  }

  function updateActiveButton(activeButton) {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
      button.classList.remove('active');
    });
    
    activeButton.classList.add('active');
  }

  function showAllArticles() {
    const articleItems = document.querySelectorAll('.article-item');
    
    articleItems.forEach(item => {
      item.classList.remove('filtered-out');
    });
  }

  function updateViewAllLink(filter, visibleCount) {
    const viewAllLink = document.querySelector('section .section a[href*="articles"]');
    
    if (viewAllLink) {
      if (filter === 'all') {
        viewAllLink.style.display = '';
      } else {
        // Hide view all link when filtering, or update text
        viewAllLink.style.display = visibleCount < 3 ? 'none' : '';
      }
    }
  }

  // Add keyboard support for accessibility
  document.addEventListener('keydown', function(e) {
    if (e.target.classList.contains('filter-btn')) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.target.click();
      }
    }
  });

})();