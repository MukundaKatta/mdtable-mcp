import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { renderMarkdownTable } from '../src/server.js';

test('renders simple table', () => {
  const out = renderMarkdownTable({
    rows: [
      { name: 'Mukunda', age: 30 },
      { name: 'Alex', age: 25 },
    ],
  });
  const lines = out.split('\n');
  assert.equal(lines[0], '| name | age |');
  assert.equal(lines[1], '| --- | --- |');
  assert.equal(lines[2], '| Mukunda | 30 |');
  assert.equal(lines[3], '| Alex | 25 |');
});

test('respects explicit column order', () => {
  const out = renderMarkdownTable({
    rows: [{ a: 1, b: 2 }],
    columns: ['b', 'a'],
  });
  assert.match(out.split('\n')[0], /\| b \| a \|/);
});

test('escapes pipes inside cells', () => {
  const out = renderMarkdownTable({ rows: [{ x: 'a|b' }] });
  assert.match(out, /a\\\|b/);
});

test('missing keys become empty cells', () => {
  const out = renderMarkdownTable({
    rows: [{ a: 1, b: 2 }, { a: 3 }],
    columns: ['a', 'b'],
  });
  const lines = out.split('\n');
  assert.equal(lines[3], '| 3 |  |');
});

test('alignment row', () => {
  const out = renderMarkdownTable({
    rows: [{ a: 1, b: 2 }],
    align: { a: 'right', b: 'center' },
  });
  const lines = out.split('\n');
  assert.equal(lines[1], '| ---: | :---: |');
});

test('empty rows yields empty string', () => {
  assert.equal(renderMarkdownTable({ rows: [] }), '');
});

test('normalizes CRLF and CR line breaks to spaces', () => {
  const out = renderMarkdownTable({ rows: [{ x: 'line1\r\nline2\rline3\nline4' }] });
  const lines = out.split('\n');
  // The row must stay on a single physical line with no stray \r.
  assert.equal(lines.length, 3);
  assert.equal(lines[2], '| line1 line2 line3 line4 |');
  assert.ok(!out.includes('\r'));
});
