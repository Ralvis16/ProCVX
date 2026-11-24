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
const GUIDE_DIRS = { es: 'guias', en: 'en/guides' };
const guidePages = sitemapUrls.filter(u => u !== SITE).map(urlToFile);

test('sitemap lists the home page, the hub and every guide, and all of them exist', () => {
    assert.ok(sitemapUrls.includes(SITE));
    for (const dir of Object.values(GUIDE_DIRS)) {
        assert.ok(sitemapUrls.includes(`${SITE}${dir}/`), `${dir}/ hub is in the sitemap`);
        const guideDirs = fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })
            .filter(d => d.isDirectory()).map(d => `${dir}/${d.name}/index.html`);
        assert.ok(guideDirs.length >= 3, `at least three guides in ${dir}`);
        for (const file of guideDirs) assert.ok(guidePages.includes(file), `${file} is in the sitemap`);
    }
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
        const lang = file.startsWith(GUIDE_DIRS.en + '/') ? 'en' : 'es';
        assert.match(html, new RegExp(`<html lang="${lang}">`));

        for (const [, json] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
            assert.doesNotThrow(() => JSON.parse(json), 'valid JSON-LD');
        }

        // Every relative href/src must resolve to a file of the site
        const dir = path.dirname(path.join(ROOT, file));
        for (const [, ref] of html.matchAll(/(?:href|src)="([^"#?]+)(?:[?#][^"]*)?"/g)) {
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

test('hreflang alternates are listed in the sitemap and link back to each other', () => {
    let pairs = 0;
    for (const file of guidePages) {
        const html = read(file);
        const self = sitemapUrls.find(u => urlToFile(u) === file);
        const alternates = Object.fromEntries([...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)">/g)]
            .map(m => [m[1], m[2]]));
        if (Object.keys(alternates).length === 0) continue;
        pairs++;
        assert.ok(alternates.es && alternates.en && alternates['x-default'], `${file}: es, en and x-default`);
        assert.ok(Object.values(alternates).includes(self), `${file}: lists itself`);
        for (const [code, url] of Object.entries(alternates)) {
            assert.ok(sitemapUrls.includes(url), `${file}: ${code} alternate ${url} is in the sitemap`);
            assert.ok(read(urlToFile(url)).includes(`hreflang="${code === 'x-default' ? 'x-default' : code}" href="${url}"`));
            assert.ok(read(urlToFile(url)).includes(`href="${self}"`), `${url} links back to ${self}`);
        }
    }
    assert.ok(pairs >= 4, 'hubs and translated guides have alternates');
});

test('the app links to the guides', () => {
    assert.match(read('index.html'), /href="guias\/"/);
});

// ---- Deployment hygiene ----
const ignored = read('.assetsignore').split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
const isIgnored = file => ignored.some(p => file === p || file.startsWith(p + '/'));
const appShell = [...read('sw.js').matchAll(/'\.\/([^']*)'/g)].map(m => m[1] || 'index.html');

test('.assetsignore keeps repository-only files off the website', () => {
    for (const p of ['.git', 'tests', 'tools', 'node_modules', 'package.json', 'README.md']) {
        assert.ok(ignored.includes(p), `${p} is ignored`);
    }
});

test('every file the website needs is published (not ignored) and exists', () => {
    const needed = [...appShell, ...sitemapUrls.map(urlToFile), '_headers', 'robots.txt', 'sitemap.xml', 'og-image.png'];
    for (const file of needed) {
        assert.ok(!isIgnored(file), `${file} is not ignored`);
        assert.ok(fs.existsSync(path.join(ROOT, file)), `${file} exists`);
    }
});

test('vendor/icons.js contains exactly the icons used in the code (run tools/build-icons.js)', () => {
    global.window = global;
    delete require.cache[require.resolve('../vendor/icons.js')];
    require('../vendor/icons.js');
    const used = new Set();
    for (const file of ['index.html', ...fs.readdirSync(ROOT).filter(f => f.endsWith('.js'))]) {
        for (const [, name] of read(file).matchAll(/data-lucide="([a-z0-9-]+)"/g)) used.add(name);
    }
    assert.deepEqual([...window.ProCVXIcons.names].sort(), [...used].sort());
});

test('Cloudflare Web Analytics beacon is on every page and allowed by the CSP', () => {
    const token = '2322de99ae1841678ec6ea683b10c55a';
    for (const file of ['index.html', ...guidePages]) {
        const html = read(file);
        assert.equal((html.match(/static\.cloudflareinsights\.com\/beacon\.min\.js/g) || []).length, 1, `${file}: one beacon`);
        assert.ok(html.includes(token), `${file}: token`);
    }
    const csp = read('_headers').match(/^\s+Content-Security-Policy: (.*)$/m)[1];
    assert.match(csp, /script-src [^;]*https:\/\/static\.cloudflareinsights\.com/);
    assert.match(csp, /connect-src [^;]*https:\/\/cloudflareinsights\.com/);
});
