// Unit tests for the pure parts of the app modules (render.js, sections.js). Run: node --test tests/
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

global.window = global;
require(path.join(__dirname, '..', 'utils.js'));
require(path.join(__dirname, '..', 'i18n.js'));
require(path.join(__dirname, '..', 'render.js'));
require(path.join(__dirname, '..', 'sections.js'));
const { html, sectionTitleDefaults } = window.ProCVXRender;
const { defaultOrder, completeOrder } = window.ProCVXSections;
const t = window.ProCVXTranslations.es;

test('experience HTML escapes user text and falls back to the field labels', () => {
    const out = html.experience({ role: '<b>Dev</b>', company: '', dates: '2025', desc: '• Hice <cosas>' }, t);
    assert.match(out, /&lt;b&gt;Dev&lt;\/b&gt;/);
    assert.ok(out.includes(t.lbl_exp_company));
    assert.match(out, /<li>Hice &lt;cosas&gt;<\/li>/);
    assert.doesNotMatch(out, /<b>/);
    // An empty description adds no description block
    assert.doesNotMatch(html.experience({ role: 'a', company: 'b', dates: '', desc: '• ' }, t), /cv-item-desc/);
});

test('project HTML turns the comma-separated technologies into badges', () => {
    const out = html.projects({ title: 'App', tech: 'JS, , <CSS>', desc: '' }, t);
    assert.equal((out.match(/cv-badge-tech/g) || []).length, 2);
    assert.ok(out.includes('&lt;CSS&gt;'));
});

test('volunteer and certification HTML omit empty optional lines', () => {
    assert.doesNotMatch(html.volunteer({ role: 'r', organization: 'o', dates: ' ', desc: '' }, t), /cv-item-dates/);
    const cert = html.certifications({ name: 'AWS', issuer: '', date: '' }, t);
    assert.doesNotMatch(cert, /cv-item-meta|cv-item-dates/);
});

test('skills HTML renders one escaped tag per skill', () => {
    assert.equal(html.skills(['a', '<b>']), '<div class="cv-tags"><span class="cv-tag">a</span><span class="cv-tag">&lt;b&gt;</span></div>');
});

test('every default section title has a translation in every language', () => {
    for (const [lang, table] of Object.entries(window.ProCVXTranslations)) {
        for (const [, key] of Object.values(sectionTitleDefaults)) assert.ok(table[key], `${lang}: ${key}`);
    }
});

test('completeOrder keeps a saved order, drops unknown ids and inserts new sections in place', () => {
    assert.deepEqual(completeOrder([...defaultOrder]), [...defaultOrder]);
    // An order saved before volunteer and certifications existed
    const old = ['cv-section-education', 'cv-section-summary', 'cv-section-experience', 'cv-section-projects',
        'cv-section-softskills', 'cv-section-skills', 'cv-section-languages', 'bogus'];
    assert.deepEqual(completeOrder(old), ['cv-section-education', 'cv-section-certifications', 'cv-section-summary',
        'cv-section-experience', 'cv-section-projects', 'cv-section-volunteer',
        'cv-section-softskills', 'cv-section-skills', 'cv-section-languages']);
    assert.deepEqual(completeOrder([]), [...defaultOrder]);
});
