for (const button of document.querySelectorAll('.copy')) {
  button.addEventListener('click', async () => {
    const text = button.closest('figure').querySelector('code').textContent;
    try { await navigator.clipboard.writeText(text); button.textContent = 'skopiowano'; }
    catch { button.textContent = 'zaznacz kod ręcznie'; }
    setTimeout(() => { button.textContent = 'kopiuj'; }, 1800);
  });
}
const input = document.getElementById('docs-search');
const results = document.getElementById('search-results');
let index;
let request = 0;
input?.addEventListener('input', async () => {
  const turn = ++request;
  const query = input.value.trim().toLocaleLowerCase('pl');
  results.replaceChildren(); results.hidden = query.length < 2;
  if (query.length < 2) return;
  try {
    index ??= fetch('search-index.json').then(response => { if (!response.ok) throw Error('search'); return response.json(); });
    const pages = await index;
    if (turn !== request) return;
    const terms = query.split(/\s+/);
    const matches = pages.filter(page => terms.every(term => `${page.title} ${page.description} ${page.text}`.toLocaleLowerCase('pl').includes(term))).slice(0, 8);
    if (!matches.length) { results.textContent = 'Brak wyników. Spróbuj innej nazwy funkcji.'; return; }
    for (const page of matches) {
      const link = document.createElement('a'); link.href = page.url;
      const title = document.createElement('strong'); title.textContent = page.title;
      const description = document.createElement('span'); description.textContent = page.description;
      link.append(title, description); results.append(link);
    }
  } catch { if (turn === request) { index = undefined; results.textContent = 'Wyszukiwanie jest niedostępne. Użyj spisu stron.'; } }
});
document.addEventListener('keydown', event => { if (event.key === 'Escape' && results) { results.hidden = true; input?.blur(); } });
