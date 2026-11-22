// Static checks for the SEO pages (guides, sitemap, robots). Run: node --test tests/
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://procvx.com/';
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');

// "https://procvx.com/guias/x/" -> "guias/x/index.html"
const urlToFile = url => {
    const rel = url.slice(SITE.length);
    return rel === '' || rel.endsWith('/') ? rel + 'index.html' : rel;
};

const sitemapUrls = [...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
const guidePages = sitemapUrls.filter(u => u.includes('/guias/')).map(urlToFile);

test('sitemap lists the home page, the hub and every guide, and all of them exist', () => {
    assert.ok(sitemapUrls.includes(SITE));
    assert.ok(sitemapUrls.includes(SITE + 'guias/'));
    const guideDirs = fs.readdirSync(path.join(ROOT, 'guias'), { withFileTypes: true })
        .filter(d => d.isDirectory()).map(d => `guias/${d.name}/index.html`);
    assert.ok(guideDirs.length >= 3, 'at least three guides');
    for (const file of guideDirs) assert.ok(guidePages.includes(file), `${file} is in the sitemap`);
    for (const url of sitemapUrls) {
        assert.ok(url.startsWith(SITE), url);
        assert.ok(fs.existsSync(path.join(ROOT, urlToFile(url))), `${url} exists`);
    }
});

test('robots.txt points to the sitemap', () => {
    assert.match(read('robots.txt'), /^Sitemap: https:\/\/procvx\.com\/sitemap\.xml$/m);
});

for (const file of guidePages) {
    test(`${file}: SEO tags, structured data and internal links`, () => {
        const html = read(file);
        const url = sitemapUrls.find(u => urlToFile(u) === file);

        const title = html.match(/<title>([^<]+)<\/title>/)[1];
        assert.ok(title.length <= 70, `title short enough for Google (${title.length})`);
        const description = html.match(/<meta name="description" content="([^"]+)">/)[1];
        assert.ok(description.length >= 70 && description.length <= 170, `description length (${description.length})`);
        assert.equal(html.match(/<link rel="canonical" href="([^"]+)">/)[1], url);
        assert.equal((html.match(/<h1>/g) || []).length, 1, 'exactly one h1');
        assert.match(html, /<html lang="es">/);

        for (const [, json] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
            assert.doesNotThrow(() => JSON.parse(json), 'valid JSON-LD');
        }

        // Every relative href/src must resolve to a file of the site
        const dir = path.dirname(path.join(ROOT, file));
        for (const [, ref] of html.matchAll(/(?:href|src)="([^"#]+)(?:#[^"]*)?"/g)) {
            if (/^(https?:|mailto:)/.test(ref)) continue;
            let target = path.resolve(dir, ref);
            if (ref.endsWith('/') || fs.existsSync(target) && fs.statSync(target).isDirectory()) {
                target = path.join(target, 'index.html');
            }
            assert.ok(fs.existsSync(target), `${file}: link "${ref}" resolves`);
        }

        // In-page table of contents anchors exist
        for (const [, id] of html.matchAll(/href="#([^"]+)"/g)) {
            assert.match(html, new RegExp(`id="${id}"`), `${file}: anchor #${id}`);
        }
    });
}

test('the app links to the guides', () => {
    assert.match(read('index.html'), /href="guias\/"/);
});
