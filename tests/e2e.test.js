// End-to-end tests in a real browser (Playwright + Chromium).
// Run: node --test tests/   (requires `playwright` and a Chromium build available to it)
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFileSync } = require('child_process');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright');

const APP_URL = pathToFileURL(path.join(__dirname, '..', 'index.html')).href;
const STATE_KEY = 'procvx-state';

let browser;
test.before(async () => {
    const real = await chromium.launch();
    // Every context gets the Cloudflare analytics beacon stubbed (tests must not depend on external hosts)
    browser = Object.create(real);
    browser.newContext = async options => {
        const context = await real.newContext(options);
        await context.route('https://static.cloudflareinsights.com/**', route => route.fulfill({
            body: 'window.__beaconLoaded = true;', contentType: 'text/javascript',
            headers: { 'Access-Control-Allow-Origin': '*' }
        }));
        return context;
    };
    browser.close = () => real.close();
});
test.after(async () => { await browser?.close(); });

// Fresh context (= empty localStorage) per test; fails the test on JS errors or native dialogs.
async function openApp(t, { viewport = { width: 1440, height: 900 } } = {}) {
    const context = await browser.newContext({ viewport, acceptDownloads: true });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('dialog', d => { errors.push('native dialog: ' + d.message()); d.dismiss(); });
    await page.goto(APP_URL);
    await page.waitForFunction(() => document.getElementById('preview-fullname').textContent.includes('Alex'));
    t.after(async () => {
        await context.close();
        assert.deepEqual(errors, [], 'no JS errors / native dialogs');
    });
    return { page, context };
}

// Local http server for tests that need a real origin (service worker, pretty URLs).
// Behaves like the Cloudflare host: "/" and "/dir/" serve index.html, /index.html redirects to /.
// Parses the Cloudflare _headers file: [{ path, headers: [[name, value]] }]
function readHeadersFile() {
    const rules = [];
    for (const line of fs.readFileSync(path.join(__dirname, '..', '_headers'), 'utf8').split('\n')) {
        if (!line.trim() || line.trim().startsWith('#')) continue;
        if (!/^\s/.test(line)) rules.push({ path: line.trim(), headers: [] });
        else {
            const i = line.indexOf(':');
            rules[rules.length - 1].headers.push([line.slice(0, i).trim(), line.slice(i + 1).trim()]);
        }
    }
    return rules;
}

async function startServer(t) {
    const http = require('http');
    const root = path.join(__dirname, '..');
    const headerRules = readHeadersFile();
    const headersFor = urlPath => Object.fromEntries(headerRules
        .filter(r => r.path === '/*' || r.path === urlPath)
        .flatMap(r => r.headers));
    const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml',
        '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };
    const server = http.createServer((req, res) => {
        let file = decodeURIComponent(new URL(req.url, 'http://x').pathname);
        // Behave like Cloudflare: /index.html redirects to /
        if (file === '/index.html') {
            res.writeHead(308, { Location: '/' }).end();
            return;
        }
        if (file.endsWith('/')) file += 'index.html';
        const full = path.join(root, file);
        if (!full.startsWith(root) || !fs.existsSync(full) || fs.statSync(full).isDirectory()) {
            res.writeHead(404).end();
            return;
        }
        res.writeHead(200, {
            'Content-Type': types[path.extname(full)] || 'application/octet-stream',
            // Same headers Cloudflare sends (CSP included), so the http tests run under the real policy
            ...headersFor(new URL(req.url, 'http://x').pathname)
        });
        fs.createReadStream(full).pipe(res);
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    t.after(() => server.close());
    return `http://127.0.0.1:${server.address().port}/`;
}

const storedState = page => page.evaluate(key => JSON.parse(localStorage.getItem(key)), STATE_KEY);
const previewText = (page, id) => page.locator('#' + id).innerText();
// Closed modals stay in the layout (faded out) but are inert, so they can't be focused or clicked
const modalIsClosed = (page, id) => page.waitForFunction(modalId => {
    const modal = document.getElementById(modalId);
    return !modal.classList.contains('active') && modal.inert;
}, id);

test('first visit shows the sample CV and the completeness meter', async t => {
    const { page } = await openApp(t);
    assert.match(await previewText(page, 'preview-fullname'), /Alex Torto\s+Ramos/);
    assert.equal(await page.locator('#cv-preview-sheet .cv-item-block').count(), 7);
    // Duplicate LinkedIn/link contact no longer shown
    assert.equal(await page.locator('#cv-contact-link-container').isHidden(), true);
    assert.match(await page.locator('#completeness-text').innerText(), /100 %/);
    assert.equal(await page.locator('#completeness-bar').getAttribute('aria-valuenow'), '100');
    assert.equal(await page.title(), 'ProCVX // Creador de Currículum Profesional');
});

test('typing updates the preview instantly and saves after a pause (debounced)', async t => {
    const { page } = await openApp(t);
    await page.locator('summary', { has: page.locator('[data-i18n="sec_personal"]') }).click();
    await page.fill('#input-fullname', 'Ana López');
    assert.equal(await previewText(page, 'preview-fullname'), 'Ana López');
    // Not written synchronously on every keystroke...
    assert.equal((await storedState(page)).fullname, 'Alex Torto Ramos');
    // ...but shortly after
    await page.waitForFunction(k => JSON.parse(localStorage.getItem(k)).fullname === 'Ana López', STATE_KEY);
    await page.reload();
    assert.equal(await page.inputValue('#input-fullname'), 'Ana López');
});

test('pending changes are flushed when the page is hidden', async t => {
    const { page } = await openApp(t);
    await page.evaluate(() => {
        const input = document.getElementById('input-title');
        input.value = 'Flush test';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        window.dispatchEvent(new Event('pagehide'));
    });
    assert.equal((await storedState(page)).title, 'Flush test');
});

test('user text is rendered as text, never as HTML', async t => {
    const { page } = await openApp(t);
    await page.locator('summary', { has: page.locator('[data-i18n="sec_personal"]') }).click();
    await page.fill('#input-fullname', '<img src=x onerror="window.__xss=1">');
    await page.fill('#input-website', 'javascript:alert(1)');
    assert.equal(await page.locator('#preview-fullname img').count(), 0);
    assert.equal(await page.evaluate(() => window.__xss), undefined);
    assert.match(await page.locator('#preview-website').getAttribute('href'), /^https:\/\//);
});

test('clear asks for confirmation in an accessible dialog and stays empty after reload', async t => {
    const { page } = await openApp(t);
    await page.click('#btn-clear-data');
    const dialog = page.locator('#confirm-modal [role="alertdialog"]');
    await dialog.waitFor({ state: 'visible' });
    assert.equal(await page.evaluate(() => document.activeElement.id), 'modal-btn-cancel');
    await page.keyboard.press('Escape');
    await modalIsClosed(page, 'confirm-modal');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'btn-clear-data', 'focus restored');

    await page.click('#btn-clear-data');
    await page.click('#modal-btn-confirm');
    await page.locator('.toast').first().waitFor();
    assert.equal(await page.inputValue('#input-fullname'), '');
    assert.equal(await page.locator('#cv-preview-sheet .cv-item-block').count(), 0);
    assert.match(await page.locator('#completeness-text').innerText(), /Falta: nombre/);

    await page.reload();
    await page.waitForTimeout(200);
    assert.equal(await page.inputValue('#input-fullname'), '', 'cleared CV is not replaced by the sample');
});

test('language switch translates the UI and the untouched sample', async t => {
    const { page } = await openApp(t);
    await page.click('#lang-dropdown-header');
    await page.click('#lang-dropdown-menu [data-lang="en"]');
    assert.equal(await page.evaluate(() => document.documentElement.lang), 'en');
    assert.equal(await page.inputValue('#input-title-education'), 'Education');
    assert.match(await page.locator('#preview-experience').innerText(), /Senior Project Manager/);
    assert.equal(await page.title(), 'ProCVX // Professional Resume Builder');
    assert.equal(await page.locator('[data-i18n="sec_education"]').innerText(), 'Education');
});

test('theme and template dropdowns work with the keyboard and expose ARIA state', async t => {
    const { page } = await openApp(t);
    const header = page.locator('#theme-dropdown-header');
    await header.focus();
    await page.keyboard.press('Enter');
    assert.equal(await header.getAttribute('aria-expanded'), 'true');
    assert.equal(await page.evaluate(() => document.activeElement.dataset.theme), 'sapphire');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    assert.equal(await header.getAttribute('aria-expanded'), 'false');
    assert.ok(await page.evaluate(() => document.body.classList.contains('theme-cyberpunk')));
    assert.equal(await page.locator('[data-theme="cyberpunk"]').getAttribute('aria-selected'), 'true');
    assert.equal(await page.locator('#theme-current-name').textContent(), 'Ciberpunk');

    const tplHeader = page.locator('#template-dropdown-header');
    await tplHeader.focus();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('End');
    await page.keyboard.press('Escape');
    assert.equal(await tplHeader.getAttribute('aria-expanded'), 'false');
    await tplHeader.click();
    await page.click('#template-dropdown-menu [data-template="minimal"]');
    assert.ok(await page.evaluate(() => document.body.classList.contains('template-minimal')));
    assert.equal(await page.locator('#template-selected-text svg').count(), 1);

    await page.reload();
    assert.ok(await page.evaluate(() =>
        document.body.classList.contains('theme-cyberpunk') && document.body.classList.contains('template-minimal')));
});

test('section toggles and reordering update the preview and persist', async t => {
    const { page } = await openApp(t);
    await page.locator('.section-toggle[data-section="cv-section-projects"]').uncheck();
    assert.equal(await page.locator('#cv-section-projects').isHidden(), true);

    const order = () => page.evaluate(() => ['cv-section-projects', 'cv-section-experience']
        .map(id => Number(document.getElementById(id).style.order)));
    const [projBefore, expBefore] = await order();
    assert.ok(expBefore < projBefore);
    const experienceItem = page.locator('.accordion-item', { has: page.locator('[data-section="cv-section-experience"]') });
    await experienceItem.locator('.btn-section-down').click();
    const [projAfter, expAfter] = await order();
    assert.ok(projAfter < expAfter);
    assert.equal(await experienceItem.locator('details').getAttribute('open'), null, 'arrow click does not open the accordion');

    await page.reload();
    assert.equal(await page.locator('#cv-section-projects').isHidden(), true);
    const [p2, e2] = await order();
    assert.ok(p2 < e2);
});

test('bullet textareas insert bullets and the preview never shows a bullet-less line', async t => {
    const { page } = await openApp(t);
    await page.locator('.accordion-item', { has: page.locator('#btn-add-experience') }).locator('summary').click();
    await page.click('#btn-add-experience');
    const item = page.locator('#experience-list .dynamic-item').last();
    await item.locator('.exp-role').fill('QA');
    const desc = item.locator('.exp-desc');
    await desc.focus();
    assert.equal(await desc.inputValue(), '• ');
    await page.keyboard.type('Uno');
    await page.keyboard.press('Enter');
    await page.keyboard.type('D');
    assert.equal(await desc.inputValue(), '• Uno\n• D');
    const lastBlock = page.locator('#preview-experience .cv-item-block').last();
    assert.equal(await lastBlock.locator('.cv-bullets li').count(), 2);
    assert.equal(await lastBlock.locator('p').count(), 0);

    // Remove + move controls
    await item.locator('.btn-move-up').click();
    assert.equal(await page.locator('#experience-list .dynamic-item').nth(2).locator('.exp-role').inputValue(), 'QA');
    await page.locator('#experience-list .dynamic-item').nth(2).locator('.btn-remove-item').click();
    await page.waitForFunction(() => document.querySelectorAll('#experience-list .dynamic-item').length === 3);
});

test('JSON export → import round trip; invalid files show a toast, not an alert', async t => {
    const { page } = await openApp(t);
    const [download] = await Promise.all([page.waitForEvent('download'), page.click('#btn-export-json')]);
    assert.equal(download.suggestedFilename(), 'Alex_Torto_Ramos_ProCVX.json');
    const exported = JSON.parse(fs.readFileSync(await download.path(), 'utf8'));
    assert.equal(exported.experience.length, 3);

    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'procvx-'));
    const bad = path.join(dir, 'bad.json');
    fs.writeFileSync(bad, '[1,2');
    await page.setInputFiles('#input-json-file', bad);
    await page.locator('.toast-error').waitFor();

    const huge = path.join(dir, 'huge.json');
    fs.writeFileSync(huge, '{"fullname":"' + 'x'.repeat(6 * 1024 * 1024) + '"}');
    await page.setInputFiles('#input-json-file', huge);
    await page.locator('.toast-error', { hasText: /5 MB/ }).waitFor();
    assert.equal(await page.inputValue('#input-fullname'), 'Alex Torto Ramos', 'oversized file ignored');

    const good = path.join(dir, 'good.json');
    fs.writeFileSync(good, JSON.stringify({
        ...exported,
        fullname: 'Importada Pérez',
        photo: 'https://evil.example/track.png',
        experience: [null, { role: 'Rol <b>', company: 'Co' }],
        toggles: { 'cv-section-languages': false }
    }));
    await page.setInputFiles('#input-json-file', good);
    await page.locator('.toast-success', { hasText: /correctamente/ }).waitFor();
    assert.equal(await page.inputValue('#input-fullname'), 'Importada Pérez');
    assert.equal(await page.locator('#preview-experience .cv-item-title').innerText(), 'Rol <b>');
    assert.equal(await page.locator('#preview-photo').isHidden(), true, 'non data: photos are ignored');
    assert.equal(await page.locator('#cv-section-languages').isHidden(), true);
    assert.equal((await storedState(page)).fullname, 'Importada Pérez');
});

test('legal dialogs open from the footer, fit on small screens and close with their button', async t => {
    const { page } = await openApp(t, { viewport: { width: 390, height: 600 } });
    for (const id of ['modal-aviso-legal', 'modal-privacidad', 'modal-storage']) {
        await page.evaluate(modalId => document.querySelector(`[data-open-modal="${modalId}"]`).click(), id);
        const close = page.locator(`[data-close-modal="${id}"]`);
        const box = await close.boundingBox();
        assert.ok(box.y >= 0 && box.y + box.height <= 600, `${id}: close button on screen (y=${box.y})`);
        await close.click();
        await modalIsClosed(page, id);
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.click('[data-open-modal="modal-privacidad"]');
    const box = page.locator('#modal-privacidad [role="dialog"]');
    await box.waitFor({ state: 'visible' });
    assert.equal(await page.evaluate(() => document.getElementById('modal-privacidad').inert), false);
    await page.click('[data-close-modal="modal-privacidad"]');
    await modalIsClosed(page, 'modal-privacidad');
});

test('mobile: editor/preview switch and a scaled A4 preview without horizontal scroll', async t => {
    const { page } = await openApp(t, { viewport: { width: 390, height: 844 } });
    assert.equal(await page.locator('.mobile-view-switch').isVisible(), true);
    assert.equal(await page.locator('.editor-panel').isVisible(), true);
    assert.equal(await page.locator('.preview-panel').isVisible(), false);

    await page.click('.mobile-view-btn[data-view="preview"]');
    assert.equal(await page.locator('.editor-panel').isVisible(), false);
    assert.equal(await page.locator('.preview-panel').isVisible(), true);
    const scale = Number(await page.locator('#cv-preview-sheet').evaluate(el => (el.style.transform.match(/scale\(([\d.]+)\)/) || [])[1]));
    assert.ok(scale > 0.3 && scale < 1, `sheet scaled with transform (${scale})`);
    // The frame matches the scaled sheet, so the preview has no empty area or overflow
    const frame = await page.locator('#cv-sheet-frame').boundingBox();
    const sheet = await page.locator('#cv-preview-sheet').boundingBox();
    assert.ok(Math.abs(frame.width - sheet.width) <= 1 && Math.abs(frame.height - sheet.height) <= 2,
        `frame ${frame.width}x${frame.height} vs sheet ${sheet.width}x${sheet.height}`);
    // Text is never auto-inflated by mobile browsers
    assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).webkitTextSizeAdjust), '100%');
    // Typing more content refits the frame height
    const before = frame.height;
    await page.evaluate(() => {
        const summary = document.getElementById('input-summary');
        summary.value = 'Texto largo de prueba. '.repeat(250); // longer than one A4 page
        summary.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await page.waitForFunction(h => document.getElementById('cv-sheet-frame').getBoundingClientRect().height > h, before);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    assert.ok(overflow <= 0, `no horizontal scroll (${overflow}px)`);
});

test('certifications and volunteering can be added, rendered, toggled and saved', async t => {
    const { page } = await openApp(t);
    await page.click('#btn-clear-data');
    await page.click('#modal-btn-confirm');
    assert.equal(await page.locator('#cv-section-certifications').isHidden(), true);
    assert.equal(await page.locator('#cv-section-volunteer').isHidden(), true);

    await page.locator('summary', { has: page.locator('[data-i18n="sec_certifications"]') }).click();
    await page.click('#btn-add-certification');
    const cert = page.locator('#certifications-list .dynamic-item').last();
    await cert.locator('.cert-name').fill('AWS Cloud Practitioner');
    await cert.locator('.cert-issuer').fill('Amazon <Web> Services');
    await cert.locator('.cert-date').fill('2025');

    await page.locator('summary', { has: page.locator('[data-i18n="sec_volunteer"]') }).click();
    await page.click('#btn-add-volunteer');
    const vol = page.locator('#volunteer-list .dynamic-item').last();
    await vol.locator('.vol-role').fill('Mentor');
    await vol.locator('.vol-org').fill('Cruz Roja');
    await vol.locator('.vol-desc').focus();
    await page.keyboard.type('Talleres');

    const certPreview = page.locator('#preview-certifications');
    assert.match(await certPreview.innerText(), /AWS Cloud Practitioner\s+Amazon <Web> Services\s+2025/);
    const volPreview = page.locator('#preview-volunteer');
    assert.match(await volPreview.innerText(), /Mentor\s+Cruz Roja/);
    assert.equal(await volPreview.locator('.cv-bullets li').innerText(), 'Talleres');
    assert.equal(await volPreview.locator('.cv-item-dates').count(), 0, 'no empty date line');
    assert.equal(await page.locator('#preview-title-certifications-header span').textContent(), 'Certificaciones');

    await page.locator('.section-toggle[data-section="cv-section-volunteer"]').uncheck();
    assert.equal(await page.locator('#cv-section-volunteer').isHidden(), true);

    await page.waitForFunction(k => JSON.parse(localStorage.getItem(k)).certifications?.length === 1, STATE_KEY);
    await page.reload();
    await page.waitForFunction(() => document.querySelectorAll('#certifications-list .dynamic-item').length === 1);
    assert.equal(await page.locator('#certifications-list .cert-issuer').inputValue(), 'Amazon <Web> Services');
    assert.equal(await page.locator('#volunteer-list .vol-desc').inputValue(), '• Talleres');
    assert.equal(await page.locator('#cv-section-volunteer').isHidden(), true);

    // Language switch translates the new default titles
    await page.click('#lang-dropdown-header');
    await page.click('#lang-dropdown-menu [data-lang="en"]');
    assert.equal(await page.inputValue('#input-title-volunteer'), 'Volunteering');
    assert.equal(await page.inputValue('#input-title-certifications'), 'Certifications');
});

test('print/PDF: the CV prints from any view, on A4, with readable bullet order', async t => {
    const { page } = await openApp(t, { viewport: { width: 390, height: 844 } });
    // Mobile page in "editor" view: print must still output the CV
    await page.emulateMedia({ media: 'print' });
    const pdfPath = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'procvx-')), 'cv.pdf');
    await page.pdf({ path: pdfPath, format: 'A4', printBackground: true });
    const info = execFileSync('pdfinfo', [pdfPath]).toString();
    const pages = Number(info.match(/Pages:\s+(\d+)/)[1]);
    assert.equal(pages, 1, 'sample CV fits on one page');
    const text = execFileSync('pdftotext', ['-layout', pdfPath, '-']).toString();
    assert.match(text, /Alex Torto/);
    assert.match(text, /•\s*Liderazgo de un equipo/, 'bullet precedes its text');
    assert.doesNotMatch(text, /Editor de Datos|Vista previa/, 'no UI in the PDF');
    assert.match(text, /CERTIFICACIONES/);
    assert.match(text, /VOLUNTARIADO/);

    // The English sample must fit on one page too
    await page.emulateMedia({ media: 'screen' });
    await page.click('#lang-dropdown-header');
    await page.click('#lang-dropdown-menu [data-lang="en"]');
    await page.emulateMedia({ media: 'print' });
    await page.pdf({ path: pdfPath, format: 'A4', printBackground: true });
    const enPages = Number(execFileSync('pdfinfo', [pdfPath]).toString().match(/Pages:\s+(\d+)/)[1]);
    assert.equal(enPages, 1, 'English sample CV fits on one page');
});

test('data saved by previous versions still loads (backwards compatibility)', async t => {
    const { page } = await openApp(t);
    await page.evaluate(() => {
        localStorage.setItem('procvx-state', JSON.stringify({
            fullname: 'Usuario Antiguo',
            github: 'github.com/antiguo',
            skills: [{ name: 'Excel' }, { name: 'SQL' }],
            languages: [{ name: 'English', level: 'Advanced' }],
            experience: [{ role: 'Analista', company: 'ACME', dates: '2020', desc: '• Algo' }]
        }));
        localStorage.setItem('procvx-section-order', JSON.stringify([
            'cv-section-summary', 'cv-section-projects', 'cv-section-experience', 'cv-section-education',
            'cv-section-softskills', 'cv-section-skills', 'cv-section-languages'
        ]));
    });
    await page.reload();
    await page.waitForFunction(() => document.getElementById('input-fullname').value === 'Usuario Antiguo');
    assert.equal(await page.inputValue('#input-link'), 'github.com/antiguo');
    assert.equal(await page.inputValue('#input-skills'), 'Excel, SQL');
    assert.equal(await page.locator('#languages-list .lang-level').inputValue(), 'Avanzado');
    assert.equal(await page.inputValue('#input-title-experience'), 'Experiencia Laboral', 'default titles filled in');
    const [proj, exp] = await page.evaluate(() => ['cv-section-projects', 'cv-section-experience']
        .map(id => Number(document.getElementById(id).style.order)));
    assert.ok(proj < exp, 'saved custom section order is kept');
    // Sections added after that order was saved go right after their default predecessor
    const [volunteer, education, certs, softskills] = await page.evaluate(() =>
        ['cv-section-volunteer', 'cv-section-education', 'cv-section-certifications', 'cv-section-softskills']
            .map(id => Number(document.getElementById(id).style.order)));
    assert.ok(proj < volunteer && volunteer < education, 'volunteer placed after projects');
    assert.ok(education < certs && certs < softskills, 'certifications placed after education');
});

test('offline: once visited over http, the app reloads and works without network', async t => {
    const url = await startServer(t);

    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    t.after(() => context.close());
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(url);
    await page.waitForFunction(() => navigator.serviceWorker.controller !== null
        || navigator.serviceWorker.ready.then(() => false), null, { timeout: 15000 }).catch(() => {});
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.locator('.toast-success', { hasText: /sin conexión/ }).waitFor();
    assert.equal(await page.evaluate(async () => (await caches.keys()).length), 1);

    await page.evaluate(() => {
        const input = document.getElementById('input-title');
        input.value = 'Hecho sin conexión';
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await page.waitForFunction(() => JSON.parse(localStorage.getItem('procvx-state')).title === 'Hecho sin conexión');

    await context.setOffline(true);
    await page.reload();
    await page.waitForFunction(() => document.getElementById('preview-title').textContent === 'Hecho sin conexión');
    assert.ok(await page.evaluate(() => typeof ProCVXIcons !== 'undefined' && typeof Sortable !== 'undefined'), 'vendor scripts served from cache');
    assert.equal(await page.locator('#cv-preview-sheet svg').first().isVisible(), true, 'icons rendered offline');
    const loadedFaces = await page.evaluate(async () =>
        (await document.fonts.load('600 16px Outfit')).filter(f => f.status === 'loaded').length);
    assert.ok(loadedFaces > 0, 'fonts load offline from the cache');

    // A bookmarked /index.html also opens offline
    await page.goto(url + 'index.html');
    await page.waitForFunction(() => document.getElementById('preview-title').textContent === 'Hecho sin conexión');
    assert.deepEqual(errors, []);
});

test('guides: readable on mobile and lead back to the app', async t => {
    const url = await startServer(t);
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    t.after(() => context.close());
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });

    await page.goto(url);
    await page.click('a[href="guias/"]');
    await page.waitForURL(url + 'guias/');
    const slugs = fs.readdirSync(path.join(__dirname, '..', 'guias'), { withFileTypes: true })
        .filter(d => d.isDirectory()).map(d => d.name);
    assert.equal(await page.locator('.cards a').count(), slugs.length);

    for (const slug of slugs) {
        await page.goto(`${url}guias/${slug}/`);
        assert.equal(await page.locator('h1').count(), 1);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        assert.ok(overflow <= 0, `${slug}: no horizontal scroll (${overflow}px)`);
    }

    await page.click('.cta a');
    await page.waitForURL(url);
    await page.waitForFunction(() => document.getElementById('preview-fullname').textContent.includes('Alex'));
    assert.deepEqual(errors, []);
});

test('English guides lead to the app in English', async t => {
    const url = await startServer(t);
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    t.after(() => context.close());
    const page = await context.newPage();

    const slugs = fs.readdirSync(path.join(__dirname, '..', 'en', 'guides'), { withFileTypes: true })
        .filter(d => d.isDirectory()).map(d => d.name);
    for (const slug of slugs) {
        await page.goto(`${url}en/guides/${slug}/`);
        assert.equal(await page.locator('html').getAttribute('lang'), 'en');
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        assert.ok(overflow <= 0, `${slug}: no horizontal scroll (${overflow}px)`);
    }

    await page.click('.cta a');
    await page.waitForURL(url + '?lang=en');
    await page.waitForFunction(() => document.documentElement.lang === 'en');
    assert.equal(await page.getAttribute('a[data-i18n="footer_guides"]', 'href'), 'en/guides/');
    // The choice is remembered without the query
    await page.goto(url);
    await page.waitForFunction(() => document.documentElement.lang === 'en');
});

test('donate link: hidden without a URL; with one, shown in the footer and suggested once after the PDF', async t => {
    const url = await startServer(t);
    const realConfig = fs.readFileSync(path.join(__dirname, '..', 'config.js'), 'utf8');
    assert.match(realConfig, /donateUrl: 'https:\/\/buymeacoffee\.com\/raniell166'/, 'production link configured');

    async function pageWithDonateUrl(donateUrl) {
        const context = await browser.newContext();
        t.after(() => context.close());
        const page = await context.newPage();
        await page.route('**/config.js*', route => route.fulfill({
            body: realConfig.replace(/donateUrl: '[^']*'/, `donateUrl: '${donateUrl}'`),
            contentType: 'text/javascript'
        }));
        await page.goto(url);
        await page.waitForFunction(() => document.getElementById('preview-fullname').textContent.includes('Alex'));
        return page;
    }

    for (const bad of ['', 'javascript:alert(1)', 'http://insecure.example']) {
        const hiddenPage = await pageWithDonateUrl(bad);
        assert.equal(await hiddenPage.locator('#donate-link').isHidden(), true, `hidden for "${bad}"`);
    }

    const page = await pageWithDonateUrl('https://buymeacoffee.com/raniell166');
    const link = page.locator('#donate-link');
    await link.waitFor({ state: 'visible' });
    assert.equal(await link.getAttribute('href'), 'https://buymeacoffee.com/raniell166');
    assert.equal(await link.getAttribute('rel'), 'noopener');

    // Simulate finishing the print dialog twice: the suggestion shows only once
    await page.evaluate(() => { window.print = () => window.dispatchEvent(new Event('afterprint')); });
    await page.click('#btn-export-pdf');
    const toastLink = page.locator('.toast .toast-action');
    await toastLink.waitFor();
    assert.equal(await toastLink.getAttribute('href'), 'https://buymeacoffee.com/raniell166');
    assert.equal(await toastLink.innerText(), 'Invítame a un café');
    await page.click('#btn-export-pdf');
    await page.waitForTimeout(900);
    assert.equal(await page.locator('.toast .toast-action').count(), 1);
});

test('accessibility: no interactive content inside <summary> (Chrome Issues panel stays clean)', async t => {
    const { page, context } = await openApp(t);
    const cdp = await context.newCDPSession(page);
    const issues = [];
    cdp.on('Audits.issueAdded', e => issues.push(e.issue.code));
    await cdp.send('Audits.enable');
    await page.reload();
    await page.waitForFunction(() => document.getElementById('preview-fullname').textContent.includes('Alex'));
    await page.waitForTimeout(500);
    assert.deepEqual(issues, [], 'no Chrome issues');
    assert.equal(await page.locator('summary :is(input, button, select, textarea, a, [tabindex])').count(), 0);

    // Header controls still work and don't toggle the accordion
    const item = page.locator('.accordion-item', { has: page.locator('[data-section="cv-section-projects"]') });
    await item.locator('.section-toggle').uncheck();
    assert.equal(await page.locator('#cv-section-projects').isHidden(), true);
    assert.equal(await item.locator('details').getAttribute('open'), null);
    await item.locator('summary').click();
    assert.equal(await item.locator('details').getAttribute('open'), '');
});

test('sections can be reordered by drag and drop (handle or header), not above fixed sections', async t => {
    const { page } = await openApp(t);
    const order = () => page.evaluate(() => [...document.querySelectorAll('.section-toggle')]
        .map(el => el.dataset.section.replace('cv-section-', '')));
    const item = s => page.locator('.accordion-item', { has: page.locator(`[data-section="cv-section-${s}"]`) });

    await item('volunteer').locator('.drag-handle').dragTo(item('projects').locator('summary'), { targetPosition: { x: 40, y: 8 } });
    let current = await order();
    assert.ok(current.indexOf('volunteer') < current.indexOf('projects'), current.join());
    assert.ok(await page.evaluate(() =>
        +document.getElementById('cv-section-volunteer').style.order < +document.getElementById('cv-section-projects').style.order));

    await item('languages').locator('summary').dragTo(item('education').locator('summary'), { targetPosition: { x: 40, y: 8 } });
    current = await order();
    assert.ok(current.indexOf('languages') < current.indexOf('education'), current.join());

    // Fixed sections (personal info, profile) stay on top
    await item('skills').locator('.drag-handle').dragTo(page.locator('.accordion-item[data-fixed]').first().locator('summary'), { targetPosition: { x: 40, y: 8 } });
    assert.equal((await order())[0], 'summary');
    assert.equal(await page.locator('.editor-accordion > .accordion-item').first().getAttribute('data-fixed'), 'true');
});

test('Content-Security-Policy from _headers: the whole app and the guides work without violations', async t => {
    const url = await startServer(t);
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, acceptDownloads: true });
    t.after(() => context.close());
    await context.addInitScript(() => {
        window.__cspViolations = [];
        document.addEventListener('securitypolicyviolation', e =>
            window.__cspViolations.push(`${e.violatedDirective} ${e.blockedURI}`));
    });
    const page = await context.newPage();
    const consoleErrors = [];
    page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
    page.on('pageerror', e => consoleErrors.push(e.message));

    const response = await page.goto(url);
    assert.match(response.headers()['content-security-policy'], /script-src 'self'/);
    await page.waitForFunction(() => document.getElementById('preview-fullname').textContent.includes('Alex'));
    assert.ok(await page.locator('.accordion-trigger svg.lucide').count() > 5, 'icons rendered');

    // Photo: blob: image + canvas data: URL
    const photo = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'procvx-')), 'photo.png');
    fs.copyFileSync(path.join(__dirname, '..', 'icons', 'icon-192.png'), photo);
    await page.setInputFiles('#input-photo', photo);
    await page.locator('#preview-photo').waitFor({ state: 'visible' });
    assert.match(await page.locator('#preview-photo').getAttribute('src'), /^data:image\/jpeg/);

    // Dropdowns, drag & drop (Sortable sets inline styles via CSSOM), dialogs, export, print
    await page.click('#template-dropdown-header');
    await page.click('[data-template="minimal"]');
    const item = s => page.locator('.accordion-item', { has: page.locator(`[data-section="cv-section-${s}"]`) });
    await item('volunteer').locator('.drag-handle').dragTo(item('projects').locator('summary'), { targetPosition: { x: 40, y: 8 } });
    await page.click('[data-open-modal="modal-privacidad"]');
    await page.click('[data-close-modal="modal-privacidad"]');
    await Promise.all([page.waitForEvent('download'), page.click('#btn-export-json')]);
    await page.evaluate(() => { window.print = () => window.dispatchEvent(new Event('afterprint')); });
    await page.click('#btn-export-pdf');
    await page.click('.mobile-view-btn[data-view="preview"]').catch(() => {});
    await page.evaluate(() => navigator.serviceWorker.ready);

    assert.equal(await page.evaluate(() => window.__beaconLoaded), true, 'analytics beacon allowed by the CSP');
    assert.deepEqual(await page.evaluate(() => window.__cspViolations), [], 'no CSP violations in the app');

    // Guides (with JSON-LD blocks)
    await page.goto(url + 'guias/cv-ats/');
    await page.locator('h1').waitFor();
    assert.deepEqual(await page.evaluate(() => window.__cspViolations), [], 'no CSP violations in the guides');
    assert.deepEqual(consoleErrors, [], 'no console errors');
});
