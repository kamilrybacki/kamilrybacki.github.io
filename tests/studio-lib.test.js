// tests/studio-lib.test.js
const test = require('node:test');
const assert = require('node:assert');
const lib = require('../public/studio/studio-lib.js');

test('slugify', () => {
  assert.equal(lib.slugify('Hello, World! 2026'), 'hello-world-2026');
  assert.equal(lib.slugify('***'), 'untitled');
});

test('oneline flattens newlines', () => {
  assert.equal(lib.oneline('a\nb   c\t d'), 'a b c d');
});

test('buildMarkdown sanitizes front-matter (no injection)', () => {
  const md = lib.buildMarkdown({
    title: 'x', description: 'd',
    category: 'CI\npermalink: /pwn/\ndraft: false',
    tags: ['safe', 'y\nlayout: evil.njk'],
    body: '## H\n\nbody',
  }, '2026-05-31');
  // front-matter block only between the first two ---
  const fm = md.split('---')[1];
  assert.ok(!/^permalink:/m.test(fm), 'no injected permalink line');
  assert.ok(!/^layout: evil/m.test(fm), 'no injected layout line');
  assert.ok(/category: "CI permalink: \/pwn\/ draft: false"/.test(md));
  assert.ok(/draft: true/.test(md));
  assert.ok(md.trim().endsWith('body'));
});

test('buildMarkdown empty tags', () => {
  assert.ok(lib.buildMarkdown({ title: 't', body: 'b', tags: [] }, '2026-05-31').includes('tags: []'));
});

test('coerceTags', () => {
  assert.deepEqual(lib.coerceTags('python'), ['python']);
  assert.deepEqual(lib.coerceTags(['a', ' b ', '']), ['a', 'b']);
  assert.deepEqual(lib.coerceTags(null), []);
});

test('extForMime', () => {
  assert.equal(lib.extForMime('audio/webm;codecs=opus'), 'webm');
  assert.equal(lib.extForMime('audio/mp4'), 'mp4');
  assert.equal(lib.extForMime('audio/mpeg'), 'mp3');
  assert.equal(lib.extForMime('audio/wav'), 'wav');
  assert.equal(lib.extForMime(''), 'webm');           // fallback
  assert.equal(lib.extForMime('weird/thing'), 'webm'); // fallback
});

test('formatDuration', () => {
  assert.equal(lib.formatDuration(0), '0:00');
  assert.equal(lib.formatDuration(53), '0:53');
  assert.equal(lib.formatDuration(75), '1:15');
});
