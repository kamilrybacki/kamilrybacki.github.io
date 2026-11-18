for (const button of document.querySelectorAll('.copy')) {
  button.addEventListener('click', async () => {
    const text = button.closest('figure').querySelector('code').textContent;
    try { await navigator.clipboard.writeText(text); button.textContent = 'Copied'; }
    catch { button.textContent = 'Select code manually'; }
    setTimeout(() => { button.textContent = 'Copy'; }, 1800);
  });
}
const input = document.getElementById('docs-search');
const results = document.getElementById('search-results');
let index;
let request = 0;
input?.addEventListener('input', async () => {
  const turn = ++request;
  const query = input.value.trim().toLocaleLowerCase('en');
  results.replaceChildren(); results.hidden = query.length < 2;
  if (query.length < 2) return;
  try {
    index ??= fetch('search-index.json').then(response => { if (!response.ok) throw Error('search'); return response.json(); });
    const pages = await index;
    if (turn !== request) return;
    const terms = query.split(/\s+/);
    const matches = pages.filter(page => terms.every(term => `${page.title} ${page.description} ${page.text}`.toLocaleLowerCase('en').includes(term))).slice(0, 8);
    if (!matches.length) { results.textContent = 'No results. Try a different keyword.'; return; }
    for (const page of matches) {
      const link = document.createElement('a'); link.href = page.url;
      const title = document.createElement('strong'); title.textContent = page.title;
      const description = document.createElement('span'); description.textContent = page.description;
      link.append(title, description); results.append(link);
    }
  } catch { if (turn === request) { index = undefined; results.textContent = 'Search is unavailable. Use the navigation.'; } }
});
document.addEventListener('keydown', event => { if (event.key === 'Escape' && results) { results.hidden = true; input?.blur(); } });

const examples = document.querySelector('[data-driver-examples]');
if (examples) {
  const tablist = examples.querySelector('[role="tablist"]');
  const tabs = [...tablist.querySelectorAll('[role="tab"]')];
  const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));

  function select(index, focus = false) {
    tabs.forEach((tab, i) => {
      const selected = i === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[i].hidden = !selected;
    });
    if (focus) tabs[index].focus();
  }

  function followHash() {
    const index = panels.findIndex(panel => '#' + panel.id === location.hash);
    if (index < 0) return;
    select(index);
    panels[index].scrollIntoView();
  }

  tabs.forEach((tab, index) => {
    const panel = panels[index];
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    tab.addEventListener('click', () => select(index));
    tab.addEventListener('keydown', event => {
      const next = {
        ArrowLeft: (index - 1 + tabs.length) % tabs.length,
        ArrowRight: (index + 1) % tabs.length,
        Home: 0,
        End: tabs.length - 1,
      }[event.key];
      if (next === undefined) return;
      event.preventDefault();
      select(next, true);
    });
  });
  tablist.hidden = false;
  select(0);
  followHash();
  window.addEventListener('hashchange', followHash);
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const index = panels.findIndex(panel => '#' + panel.id === link.getAttribute('href'));
    if (index >= 0) select(index);
  });
}
