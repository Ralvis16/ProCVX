// Unit tests for the pure helpers. Run: node --test tests/
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

global.window = global;
require(path.join(__dirname, '..', 'utils.js'));
require(path.join(__dirname, '..', 'i18n.js'));
require(path.join(__dirname, '..', 'sample-data.js'));
const U = window.ProCVXUtils;

test('escapeHtml escapes every HTML-significant character', () => {
    assert.equal(U.escapeHtml(`<a href="x" onclick='y'>&</a>`),
        '&lt;a href=&quot;x&quot; onclick=&#39;y&#39;&gt;&amp;&lt;/a&gt;');
    assert.equal(U.escapeHtml(null), '');
    assert.equal(U.escapeHtml(undefined), '');
});

test('formatDescHtml builds paragraphs and bullet lists, escaping text', () => {
    const html = U.formatDescHtml('Intro\n• uno\n• <b>dos</b>\n\nCierre\n•   ');
    assert.equal(html, '<p>Intro</p><ul class="cv-bullets"><li>uno</li><li>&lt;b&gt;dos&lt;/b&gt;</li></ul><p>Cierre</p>');
});

test('hasRealText ignores bullets and whitespace', () => {
    assert.equal(U.hasRealText('• \n•  '), false);
    assert.equal(U.hasRealText('• a'), true);
    assert.equal(U.hasRealText(42), false);
});

test('parseCommaSeparated trims and drops empty values', () => {
    assert.deepEqual(U.parseCommaSeparated(' a, ,b ,, c '), ['a', 'b', 'c']);
    assert.deepEqual(U.parseCommaSeparated(undefined), []);
});

test('normalizeLevel maps English levels to stored Spanish values', () => {
    assert.equal(U.normalizeLevel('Advanced'), 'Avanzado');
    assert.equal(U.normalizeLevel('Nativo'), 'Nativo');
});

test('toSafeUrl only produces http(s) links', () => {
    assert.equal(U.toSafeUrl('github.com/me'), 'https://github.com/me');
    assert.equal(U.toSafeUrl('http://a.com'), 'http://a.com');
    assert.equal(U.toSafeUrl('HTTPS://A.com'), 'HTTPS://A.com');
    assert.equal(U.toSafeUrl('javascript:alert(1)'), 'https://javascript:alert(1)');
    assert.equal(U.toSafeUrl('  '), '');
});

test('debounce delays calls and supports flush / cancel', async () => {
    let calls = 0;
    const d = U.debounce(() => calls++, 30);
    d(); d(); d();
    assert.equal(calls, 0);
    await new Promise(r => setTimeout(r, 60));
    assert.equal(calls, 1);
    d();
    d.flush();
    assert.equal(calls, 2);
    d.flush(); // nothing pending
    assert.equal(calls, 2);
    d();
    d.cancel();
    await new Promise(r => setTimeout(r, 60));
    assert.equal(calls, 2);
});

test('ES and EN translations define exactly the same keys', () => {
    const { es, en } = window.ProCVXTranslations;
    assert.deepEqual(Object.keys(es).sort(), Object.keys(en).sort());
});

test('sample data is chronologically coherent and has no duplicate links', () => {
    for (const sample of Object.values(window.ProCVXSampleData)) {
        assert.notEqual(sample.link, sample.linkedin);
        const startYear = d => Number(String(d).match(/\d{4}/)[0]);
        const exp = sample.experience.map(e => startYear(e.dates));
        assert.deepEqual(exp, [...exp].sort((a, b) => b - a), 'experience newest first');
        const edu = sample.education.map(e => startYear(e.dates));
        assert.deepEqual(edu, [...edu].sort((a, b) => b - a), 'education newest first');
        for (const lang of sample.languages) {
            assert.ok(U.levelLabelKeys[lang.level], `valid level ${lang.level}`);
        }
    }
});
