#!/usr/bin/env python3
"""Generates the SEO guide pages in guias/ (Spanish) and en/guides/ (English), and sitemap.xml.

Usage: python3 tools/build-guides.py
Edit GUIDES_ES in tools/guides_es.py or GUIDES_EN in tools/guides_en.py (content is plain HTML) and run
the script again. An English guide names its Spanish counterpart, and both get hreflang links.
"""
import html
import json
from pathlib import Path

from guides_en import GUIDES_EN
from guides_es import GUIDES_ES as GUIDES

SITE = 'https://procvx.com/'
ROOT = Path(__file__).resolve().parent.parent
PUBLISHED = '2026-11-22'  # default date; a guide can set its own 'published'
MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto',
          'septiembre', 'octubre', 'noviembre', 'diciembre']


MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
             'September', 'October', 'November', 'December']


def human_date(iso):
    y, m, d = (int(x) for x in iso.split('-'))
    return f'{d} de {MONTHS[m - 1]} de {y}'


def human_date_en(iso):
    y, m, d = (int(x) for x in iso.split('-'))
    return f'{MONTHS_EN[m - 1]} {d}, {y}'


LANGS = {
    'es': {
        'base': 'guias/', 'og_locale': 'es_ES', 'app_query': '', 'date': human_date,
        'header_cta': 'Crear mi CV gratis', 'breadcrumb': 'Migas de pan', 'guides': 'Guías',
        'updated': 'Actualizado:', 'related': 'Otras guías', 'footer_app': 'Creador de CV gratis',
        'switch': 'Leer en español',
        'cta': '''
<section class="cta">
  <h2>Pon estos consejos en práctica</h2>
  <p>Crea tu CV gratis con ProCVX: vista previa en tiempo real, plantillas listas para imprimir y exportación a PDF. Sin registro y tus datos no salen de tu dispositivo.</p>
  <a href="{app}">Crear mi CV ahora</a>
</section>''',
        'hub_title': 'Guías para hacer un buen CV',
        'hub_description': 'Guías prácticas y gratuitas para hacer un buen currículum: CV sin experiencia, filtros ATS, FP, hostelería, perfil profesional y carta de presentación.',
        'hub_lead': 'Consejos prácticos y ejemplos para que tu currículum llegue a una persona y le convenza.',
    },
    'en': {
        'base': 'en/guides/', 'og_locale': 'en_US', 'app_query': '?lang=en', 'date': human_date_en,
        'header_cta': 'Build my resume free', 'breadcrumb': 'Breadcrumb', 'guides': 'Guides',
        'updated': 'Updated:', 'related': 'More guides', 'footer_app': 'Free resume builder',
        'switch': 'Read in English',
        'cta': '''
<section class="cta">
  <h2>Put these tips into practice</h2>
  <p>Build your resume for free with ProCVX: live preview, print-ready templates and PDF export. No sign-up, and your data never leaves your device.</p>
  <a href="{app}">Build my resume now</a>
</section>''',
        'hub_title': 'Guides to writing a great resume',
        'hub_description': 'Free, practical guides to writing a good resume: no experience, ATS filters, resume summary, cover letter and hospitality jobs, with examples.',
        'hub_lead': 'Practical tips and examples so your resume reaches a person and convinces them.',
    },
}


def page(*, lang, title, description, path, body, breadcrumbs, depth, json_ld, alternates):
    """alternates: {lang: path} of every language version of this page, itself included."""
    L = LANGS[lang]
    up = '../' * depth
    app = up + L['app_query']
    crumbs = []
    for name, href in breadcrumbs:
        if href is None:
            crumbs.append(f'<li aria-current="page">{html.escape(name)}</li>')
        else:
            crumbs.append(f'<li><a href="{href}">{html.escape(name)}</a></li>')
    canonical = SITE + path
    hreflang = ''
    switch = ''
    if len(alternates) > 1:
        links = [f'<link rel="alternate" hreflang="{code}" href="{SITE + p}">' for code, p in alternates.items()]
        links.append(f'<link rel="alternate" hreflang="x-default" href="{SITE + alternates["es"]}">')
        hreflang = ''.join(f'\n    {link}' for link in links)
        switch = ''.join(
            f' · <a href="{up}{p}" hreflang="{code}" lang="{code}">{LANGS[code]["switch"]}</a>'
            for code, p in alternates.items() if code != lang
        )
    return f'''<!DOCTYPE html>
<html lang="{lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{html.escape(title)} | ProCVX</title>
    <meta name="description" content="{html.escape(description)}">
    <link rel="canonical" href="{canonical}">{hreflang}
    <meta property="og:type" content="article">
    <meta property="og:locale" content="{L['og_locale']}">
    <meta property="og:title" content="{html.escape(title)}">
    <meta property="og:description" content="{html.escape(description)}">
    <meta property="og:url" content="{canonical}">
    <meta property="og:image" content="{SITE}og-image.png">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="theme-color" content="#090d16">
    <link rel="icon" href="{up}favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="{up}fonts/fonts.css">
    <link rel="stylesheet" href="{up}guias/guias.css">
    <script type="application/ld+json">{json.dumps(json_ld, ensure_ascii=False)}</script>
</head>
<body>
    <header class="site-header">
        <div class="site-header-inner">
            <a class="brand" href="{app}"><img src="{up}favicon.svg" alt="" width="32" height="32"><span class="brand-name">Pro<span>CVX</span></span></a>
            <a class="header-cta" href="{app}">{L['header_cta']}</a>
        </div>
    </header>
    <main class="page">
        <nav class="breadcrumb" aria-label="{L['breadcrumb']}"><ol>{''.join(crumbs)}</ol></nav>
{body}
    </main>
    <footer class="site-footer">
        <div class="site-footer-inner">
            <p>&copy; 2026 ProCVX · <a href="{app}">{L['footer_app']}</a> · <a href="{up}{L['base']}">{L['guides']}</a>{switch}</p>
        </div>
    </footer>
    <!-- Cloudflare Web Analytics (cookieless). Its host is allowed in the CSP of _headers -->
    <script type="module" src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{{"token": "2322de99ae1841678ec6ea683b10c55a"}}'></script>
</body>
</html>
'''


def card(href, guide):
    return (f'<li><a href="{href}"><strong>{html.escape(guide["title"])}</strong>'
            f'<span>{html.escape(guide["description"])}</span></a></li>')


def build_language(lang, guides, counterparts):
    """Writes one language's guides and hub. counterparts: {slug: {lang: path}} for hreflang.
    Returns the (url, lastmod) pairs for the sitemap."""
    L = LANGS[lang]
    base = L['base']
    depth = base.count('/')  # guias/ -> 1, en/guides/ -> 2
    org = {'@type': 'Organization', 'name': 'ProCVX', 'url': SITE}
    newest = max(g.get('published', PUBLISHED) for g in guides)
    urls = [(SITE + base, newest)]
    to_root = '../' * (depth + 1)

    for guide in guides:
        path = f"{base}{guide['slug']}/"
        published = guide.get('published', PUBLISHED)
        related = ''.join(card(f'../{g["slug"]}/', g) for g in guides if g is not guide)
        body = f'''        <article>
            <h1>{html.escape(guide['title'])}</h1>
            <p class="lead">{guide['lead']}</p>
            <p class="meta">{L['updated']} <time datetime="{published}">{L['date'](published)}</time></p>
{guide['body']}
{L['cta'].format(app=to_root + L['app_query'])}
        </article>
        <section aria-labelledby="related-title">
            <h2 id="related-title">{L['related']}</h2>
            <ul class="cards">{related}</ul>
        </section>'''
        json_ld = [
            {
                '@context': 'https://schema.org', '@type': 'Article',
                'headline': guide['title'], 'description': guide['description'],
                'inLanguage': lang, 'datePublished': published, 'dateModified': published,
                'mainEntityOfPage': SITE + path, 'image': SITE + 'og-image.png',
                'author': org, 'publisher': org,
            },
            {
                '@context': 'https://schema.org', '@type': 'BreadcrumbList',
                'itemListElement': [
                    {'@type': 'ListItem', 'position': 1, 'name': 'ProCVX', 'item': SITE},
                    {'@type': 'ListItem', 'position': 2, 'name': L['guides'], 'item': SITE + base},
                    {'@type': 'ListItem', 'position': 3, 'name': guide['short'], 'item': SITE + path},
                ],
            },
        ]
        target = ROOT / path / 'index.html'
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(page(
            lang=lang, title=guide['title'], description=guide['description'], path=path, body=body,
            depth=depth + 1, json_ld=json_ld, alternates=counterparts.get(guide['slug'], {lang: path}),
            breadcrumbs=[('ProCVX', to_root + L['app_query']), (L['guides'], '../'), (guide['short'], None)],
        ), encoding='utf-8')
        urls.append((SITE + path, published))

    cards = ''.join(card(f'{g["slug"]}/', g) for g in guides)
    hub_body = f'''        <h1>{html.escape(L['hub_title'])}</h1>
        <p class="lead">{L['hub_lead']}</p>
        <ul class="cards">{cards}</ul>
{L['cta'].format(app='../' * depth + L['app_query'])}'''
    (ROOT / base / 'index.html').write_text(page(
        lang=lang, title=L['hub_title'], description=L['hub_description'], path=base, body=hub_body, depth=depth,
        breadcrumbs=[('ProCVX', '../' * depth + L['app_query']), (L['guides'], None)],
        alternates={code: LANGS[code]['base'] for code in LANGS},
        json_ld={'@context': 'https://schema.org', '@type': 'CollectionPage', 'name': L['hub_title'],
                 'description': L['hub_description'], 'inLanguage': lang, 'url': SITE + base},
    ), encoding='utf-8')
    return urls


def build():
    es_base, en_base = LANGS['es']['base'], LANGS['en']['base']
    es_slugs = {g['slug'] for g in GUIDES}
    counterparts_es, counterparts_en = {}, {}
    for g in GUIDES_EN:
        assert g['es'] in es_slugs, f"{g['slug']}: unknown Spanish guide {g['es']}"
        pair = {'es': f"{es_base}{g['es']}/", 'en': f"{en_base}{g['slug']}/"}
        counterparts_es[g['es']] = counterparts_en[g['slug']] = pair

    urls = [(SITE, PUBLISHED)]
    urls += build_language('es', GUIDES, counterparts_es)
    urls += build_language('en', GUIDES_EN, counterparts_en)

    sitemap = ['<?xml version="1.0" encoding="UTF-8"?>',
               '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    sitemap += [f'  <url><loc>{u}</loc><lastmod>{d}</lastmod></url>' for u, d in urls]
    sitemap.append('</urlset>')
    (ROOT / 'sitemap.xml').write_text('\n'.join(sitemap) + '\n', encoding='utf-8')
    print(f'Built {len(GUIDES)} Spanish + {len(GUIDES_EN)} English guides and their hubs, '
          f'sitemap with {len(urls)} URLs')


if __name__ == '__main__':
    build()
