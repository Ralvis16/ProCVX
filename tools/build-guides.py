#!/usr/bin/env python3
"""Generates the SEO guide pages in guias/ and sitemap.xml.

Usage: python3 tools/build-guides.py
Edit the GUIDES list below (content is plain HTML) and run the script again.
"""
import html
import json
from pathlib import Path

SITE = 'https://procvx.com/'
ROOT = Path(__file__).resolve().parent.parent
PUBLISHED = '2026-11-22'

GUIDES = [
    {
        'slug': 'cv-sin-experiencia',
        'title': 'Cómo hacer un CV sin experiencia laboral (con ejemplos)',
        'short': 'CV sin experiencia',
        'description': 'Guía paso a paso para hacer tu primer currículum sin experiencia: qué secciones incluir, cómo destacar estudios, proyectos y voluntariado, y ejemplos reales de frases.',
        'lead': 'No tener experiencia no significa no tener nada que contar. Un buen primer CV demuestra lo que sabes hacer con lo que ya has hecho: estudios, prácticas, proyectos, voluntariado o trabajos puntuales.',
        'body': '''
<nav class="toc" aria-label="Contenido">
  <strong>En esta guía</strong>
  <ol>
    <li><a href="#orden">El orden de las secciones</a></li>
    <li><a href="#perfil">Un perfil corto y concreto</a></li>
    <li><a href="#experiencia">Qué poner en lugar de experiencia</a></li>
    <li><a href="#habilidades">Habilidades que se puedan comprobar</a></li>
    <li><a href="#errores">Errores frecuentes</a></li>
  </ol>
</nav>

<h2 id="orden">1. El orden de las secciones</h2>
<p>Quien lee tu CV dedica unos segundos a la primera mirada, así que lo más fuerte debe ir arriba. Sin experiencia laboral, un orden que funciona bien es:</p>
<ol>
  <li><strong>Datos de contacto:</strong> nombre, teléfono, correo y ciudad. Si tienes LinkedIn o un portafolio, añádelo.</li>
  <li><strong>Perfil profesional:</strong> dos o tres líneas sobre quién eres y qué buscas.</li>
  <li><strong>Formación:</strong> tu punto fuerte ahora mismo.</li>
  <li><strong>Proyectos, prácticas o voluntariado:</strong> lo que hace de “experiencia”.</li>
  <li><strong>Habilidades, tecnología e idiomas.</strong></li>
</ol>
<p>Una página es suficiente. Un primer CV de dos páginas suele indicar relleno.</p>

<h2 id="perfil">2. Un perfil corto y concreto</h2>
<p>Evita frases que podría escribir cualquiera (“persona responsable y con ganas de aprender”). Di qué estudias o has estudiado, qué sabes hacer y a qué puesto aspiras.</p>
<div class="compare">
  <div class="bad"><span class="label">Genérico</span>Joven motivado, responsable y con muchas ganas de aprender y crecer profesionalmente.</div>
  <div class="good"><span class="label">Concreto</span>Técnico en Administración y Finanzas recién titulado. Manejo Excel avanzado y facturación con A3. Busco mi primer puesto en un departamento contable.</div>
</div>

<h2 id="experiencia">3. Qué poner en lugar de experiencia</h2>
<p>Las empresas que contratan perfiles junior no esperan años de trabajo: buscan pruebas de que sabes aplicar lo aprendido. Todo esto cuenta:</p>
<ul>
  <li><strong>Prácticas</strong> de tu ciclo, grado o máster, aunque hayan durado pocas semanas.</li>
  <li><strong>Proyectos</strong> de clase, el trabajo de fin de grado o de ciclo, o proyectos personales (una web, una app, un estudio de mercado…).</li>
  <li><strong>Voluntariado</strong> y actividades en asociaciones, clubes o eventos.</li>
  <li><strong>Trabajos puntuales</strong> como camarero, monitor, dependiente o clases particulares: demuestran responsabilidad y trato con personas.</li>
</ul>
<p>Descríbelos con verbos de acción y, si puedes, con un resultado.</p>
<div class="compare">
  <div class="bad"><span class="label">Vago</span>Hice un proyecto de una web en clase.</div>
  <div class="good"><span class="label">Con resultado</span>Desarrollé en equipo la web de reservas de un restaurante (HTML, CSS y JavaScript); nota final de 9,5.</div>
</div>
<div class="tip"><p><strong>Consejo:</strong> en ProCVX puedes renombrar cualquier sección. Si no tienes experiencia, cambia el título “Experiencia laboral” por “Prácticas” o desactívala y usa “Proyectos” y “Voluntariado”.</p></div>

<h2 id="habilidades">4. Habilidades que se puedan comprobar</h2>
<p>Separa las herramientas concretas (Excel, Photoshop, SQL, un idioma) de las habilidades personales, y no te limites a enumerarlas: si puedes, demuéstralas en tus proyectos.</p>
<ul>
  <li>En <strong>idiomas</strong>, indica un nivel realista (B1, B2…) o “intermedio”/“avanzado”. En una entrevista lo pueden comprobar.</li>
  <li>Las <strong>certificaciones y cursos</strong> cortos (ofimática, prevención de riesgos, manipulador de alimentos, cursos online) suman, sobre todo si están relacionados con el puesto.</li>
</ul>

<h2 id="errores">5. Errores frecuentes</h2>
<ul>
  <li>Un correo poco profesional. Usa nombre y apellido.</li>
  <li>Faltas de ortografía. Léelo en voz alta o pide a alguien que lo revise.</li>
  <li>Mandar el mismo CV a todas las ofertas. Ajusta el perfil y el orden de las habilidades a cada una.</li>
  <li>Enviarlo en Word. Expórtalo a PDF para que se vea igual en cualquier dispositivo.</li>
</ul>
''',
    },
    {
        'slug': 'cv-ats',
        'title': 'CV para filtros ATS: cómo pasar el primer filtro automático',
        'short': 'CV compatible con ATS',
        'description': 'Qué es un sistema ATS, por qué puede descartar tu currículum antes de que lo lea una persona y cómo preparar un CV que los filtros lean sin problemas.',
        'lead': 'Muchas empresas usan programas de selección (ATS) que leen y ordenan los currículums antes de que los vea una persona. Si el programa no entiende tu CV, puede quedar al final de la lista aunque encajes en el puesto.',
        'body': '''
<nav class="toc" aria-label="Contenido">
  <strong>En esta guía</strong>
  <ol>
    <li><a href="#que-es">Qué es un ATS</a></li>
    <li><a href="#formato">Formato que los ATS leen bien</a></li>
    <li><a href="#palabras">Palabras clave de la oferta</a></li>
    <li><a href="#comprobar">Cómo comprobar tu CV</a></li>
  </ol>
</nav>

<h2 id="que-es">1. Qué es un ATS</h2>
<p>Un <em>Applicant Tracking System</em> es el programa con el que una empresa gestiona sus ofertas: recibe los CV, extrae su texto (nombre, puestos, fechas, estudios, habilidades) y permite al equipo de selección buscar y filtrar candidatos. Los usan desde grandes empresas hasta portales de empleo.</p>
<p>Lo importante: el ATS trabaja con el <strong>texto</strong> de tu CV. Lo que no pueda extraer como texto, para él no existe.</p>

<h2 id="formato">2. Formato que los ATS leen bien</h2>
<ul>
  <li><strong>Una sola columna</strong> es lo más seguro. Algunos sistemas leen las columnas mezcladas.</li>
  <li><strong>Títulos de sección estándar:</strong> “Experiencia laboral”, “Formación”, “Habilidades”, “Idiomas”. Un título creativo (“Mi camino”) puede no reconocerse.</li>
  <li><strong>Texto real, no imágenes:</strong> nada de logos con tu nombre ni capturas de títulos. Los iconos decorativos no molestan si el dato está escrito al lado.</li>
  <li><strong>Datos de contacto en el cuerpo del documento</strong>, no en el encabezado o pie de página de Word, que algunos programas ignoran.</li>
  <li><strong>Fechas claras y consistentes</strong> (“Mar 2021 – Actualidad”).</li>
  <li><strong>PDF generado desde texto</strong>, no escaneado. Si al abrirlo puedes seleccionar y copiar las palabras, un ATS también puede leerlas.</li>
  <li>Evita tablas complejas, cuadros de texto y gráficos de “nivel de habilidad” (barras o estrellas): no transmiten información legible.</li>
</ul>
<div class="tip"><p><strong>En ProCVX:</strong> la estructura <strong>Minimalista (apta ATS)</strong> usa una sola columna y exporta a PDF con texto seleccionable, con las viñetas en el orden correcto.</p></div>

<h2 id="palabras">3. Palabras clave de la oferta</h2>
<p>El equipo de selección suele buscar en el ATS por términos de la oferta: el nombre del puesto, herramientas, titulaciones o certificaciones. Si tu CV no los contiene, no aparecerás en esas búsquedas.</p>
<ol>
  <li>Lee la oferta y subraya requisitos concretos: “SAP”, “atención al cliente”, “carné de carretillero”, “inglés B2”.</li>
  <li>Comprueba cuáles tienes de verdad y escríbelos <strong>con las mismas palabras</strong> que la oferta, en tu perfil, experiencia o habilidades.</li>
  <li>Incluye tanto la sigla como la forma completa cuando exista: “Prevención de Riesgos Laborales (PRL)”.</li>
</ol>
<div class="compare">
  <div class="bad"><span class="label">No coincide</span>Gestión de pedidos con el programa de la empresa.</div>
  <div class="good"><span class="label">Coincide con la oferta</span>Gestión de pedidos y facturación en SAP Business One.</div>
</div>
<p>No rellenes el CV con palabras clave que no puedes justificar: superar el filtro solo sirve si después lo demuestras en la entrevista.</p>

<h2 id="comprobar">4. Cómo comprobar tu CV</h2>
<ul>
  <li>Abre el PDF, selecciona todo (Ctrl+A) y pégalo en un bloc de notas. Si el texto sale en orden y completo, vas bien.</li>
  <li>Revisa que tu nombre, correo y teléfono aparezcan como texto.</li>
  <li>Nombra el archivo de forma clara: <code>Nombre_Apellido_CV.pdf</code>.</li>
</ul>
''',
    },
    {
        'slug': 'cv-fp',
        'title': 'Cómo hacer un CV si estudias o terminaste una FP',
        'short': 'CV para FP',
        'description': 'Cómo hacer el CV si estudias o terminaste una FP de grado medio o superior: el ciclo, las prácticas en empresa, los proyectos y los carnés.',
        'lead': 'La Formación Profesional es muy práctica, y tu CV debe reflejarlo. Las empresas que contratan perfiles de FP quieren ver qué sabes hacer con tus manos y herramientas desde el primer día.',
        'body': '''
<nav class="toc" aria-label="Contenido">
  <strong>En esta guía</strong>
  <ol>
    <li><a href="#titulo">Cómo escribir tu titulación</a></li>
    <li><a href="#practicas">Las prácticas en empresa</a></li>
    <li><a href="#proyecto">El proyecto final y otros trabajos</a></li>
    <li><a href="#certificaciones">Carnés y certificaciones</a></li>
    <li><a href="#ejemplo">Ejemplo de estructura</a></li>
  </ol>
</nav>

<h2 id="titulo">1. Cómo escribir tu titulación</h2>
<p>Escribe el nombre <strong>completo y oficial</strong> del ciclo, el nivel y el centro. Las siglas solas (DAM, SMR, TCAE…) pueden no entenderse fuera de tu sector o en un filtro automático.</p>
<div class="compare">
  <div class="bad"><span class="label">Poco claro</span>DAM — IES Tecnológico</div>
  <div class="good"><span class="label">Claro</span>Técnico Superior en Desarrollo de Aplicaciones Multiplataforma (DAM) · IES Tecnológico · 2024 – 2026</div>
</div>
<p>Si todavía estás estudiando, indícalo: “En curso, finalizo en junio de 2026”. Es un dato que la empresa necesita para saber cuándo puedes incorporarte.</p>

<h2 id="practicas">2. Las prácticas en empresa</h2>
<p>Las prácticas del ciclo (la formación en empresa, antes conocida como FCT) son <strong>experiencia real</strong>: ponlas en la sección de experiencia, con el nombre de la empresa, las fechas y lo que hiciste.</p>
<ul>
  <li>Describe tareas concretas: “Montaje y configuración de 40 equipos para la nueva oficina”.</li>
  <li>Nombra las herramientas, máquinas o programas que usaste.</li>
  <li>Si te ofrecieron quedarte o te dieron buena valoración, dilo.</li>
</ul>

<h2 id="proyecto">3. El proyecto final y otros trabajos</h2>
<p>El proyecto intermodular o de fin de ciclo, y los trabajos más completos de clase, demuestran que sabes llevar algo de principio a fin. Inclúyelos en una sección de <strong>Proyectos</strong>: qué hiciste, con qué herramientas y el resultado.</p>
<div class="example">
  <p><strong>App de gestión de citas para una peluquería</strong><br>
  Aplicación Android con base de datos local y recordatorios. Desarrollada en Kotlin; presentada ante tribunal con calificación de 9.<br>
  <em>Kotlin · SQLite · Android Studio</em></p>
</div>

<h2 id="certificaciones">4. Carnés y certificaciones</h2>
<p>En muchos oficios abren puertas por sí solos. Agrúpalos en una sección de <strong>Certificaciones</strong>:</p>
<ul>
  <li>Prevención de Riesgos Laborales (curso básico de 60 h u otros).</li>
  <li>Carnés profesionales: carretillero, plataformas elevadoras, manipulador de alimentos, instalador…</li>
  <li>Certificaciones de fabricantes o plataformas (Cisco, Microsoft, AWS…).</li>
  <li>Carné de conducir y vehículo propio, si el puesto implica desplazamientos.</li>
</ul>

<h2 id="ejemplo">5. Ejemplo de estructura</h2>
<ol>
  <li>Datos de contacto y perfil (tu ciclo + lo que buscas).</li>
  <li>Formación: el ciclo, con su nombre completo.</li>
  <li>Experiencia: prácticas en empresa y trabajos.</li>
  <li>Proyectos.</li>
  <li>Certificaciones y carnés.</li>
  <li>Tecnología / herramientas, habilidades e idiomas.</li>
</ol>
<div class="tip"><p><strong>Consejo:</strong> en ProCVX puedes reordenar estas secciones arrastrándolas y ocultar las que no uses, sin perder lo que has escrito.</p></div>
''',
    },
]


def page(*, title, description, path, body, breadcrumbs, depth, json_ld):
    up = '../' * depth
    crumbs = []
    for i, (name, href) in enumerate(breadcrumbs):
        if href is None:
            crumbs.append(f'<li aria-current="page">{html.escape(name)}</li>')
        else:
            crumbs.append(f'<li><a href="{href}">{html.escape(name)}</a></li>')
    canonical = SITE + path
    return f'''<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{html.escape(title)} | ProCVX</title>
    <meta name="description" content="{html.escape(description)}">
    <link rel="canonical" href="{canonical}">
    <meta property="og:type" content="article">
    <meta property="og:locale" content="es_ES">
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
            <a class="brand" href="{up}"><img src="{up}favicon.svg" alt="" width="32" height="32"><span class="brand-name">Pro<span>CVX</span></span></a>
            <a class="header-cta" href="{up}">Crear mi CV gratis</a>
        </div>
    </header>
    <main class="page">
        <nav class="breadcrumb" aria-label="Migas de pan"><ol>{''.join(crumbs)}</ol></nav>
{body}
    </main>
    <footer class="site-footer">
        <div class="site-footer-inner">
            <p>&copy; 2026 ProCVX · <a href="{up}">Creador de CV gratis</a> · <a href="{up}guias/">Guías</a></p>
        </div>
    </footer>
    <!-- Cloudflare Web Analytics (cookieless). Its host is allowed in the CSP of _headers -->
    <script type="module" src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{{"token": "2322de99ae1841678ec6ea683b10c55a"}}'></script>
</body>
</html>
'''


CTA = '''
<section class="cta">
  <h2>Pon estos consejos en práctica</h2>
  <p>Crea tu CV gratis con ProCVX: vista previa en tiempo real, plantillas listas para imprimir y exportación a PDF. Sin registro y tus datos no salen de tu dispositivo.</p>
  <a href="{up}">Crear mi CV ahora</a>
</section>'''


def build():
    out_dir = ROOT / 'guias'
    urls = [SITE, SITE + 'guias/']
    org = {'@type': 'Organization', 'name': 'ProCVX', 'url': SITE}

    for guide in GUIDES:
        path = f"guias/{guide['slug']}/"
        related = ''.join(
            f'<li><a href="../{g["slug"]}/"><strong>{html.escape(g["title"])}</strong><span>{html.escape(g["description"])}</span></a></li>'
            for g in GUIDES if g is not guide
        )
        body = f'''        <article>
            <h1>{html.escape(guide['title'])}</h1>
            <p class="lead">{guide['lead']}</p>
            <p class="meta">Actualizado: <time datetime="{PUBLISHED}">22 de noviembre de 2026</time></p>
{guide['body']}
{CTA.format(up='../../')}
        </article>
        <section aria-labelledby="related-title">
            <h2 id="related-title">Otras guías</h2>
            <ul class="cards">{related}</ul>
        </section>'''
        json_ld = [
            {
                '@context': 'https://schema.org', '@type': 'Article',
                'headline': guide['title'], 'description': guide['description'],
                'inLanguage': 'es', 'datePublished': PUBLISHED, 'dateModified': PUBLISHED,
                'mainEntityOfPage': SITE + path, 'image': SITE + 'og-image.png',
                'author': org, 'publisher': org,
            },
            {
                '@context': 'https://schema.org', '@type': 'BreadcrumbList',
                'itemListElement': [
                    {'@type': 'ListItem', 'position': 1, 'name': 'ProCVX', 'item': SITE},
                    {'@type': 'ListItem', 'position': 2, 'name': 'Guías', 'item': SITE + 'guias/'},
                    {'@type': 'ListItem', 'position': 3, 'name': guide['short'], 'item': SITE + path},
                ],
            },
        ]
        target = out_dir / guide['slug'] / 'index.html'
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(page(
            title=guide['title'], description=guide['description'], path=path, body=body, depth=2,
            breadcrumbs=[('ProCVX', '../../'), ('Guías', '../'), (guide['short'], None)], json_ld=json_ld,
        ), encoding='utf-8')
        urls.append(SITE + path)

    cards = ''.join(
        f'<li><a href="{g["slug"]}/"><strong>{html.escape(g["title"])}</strong><span>{html.escape(g["description"])}</span></a></li>'
        for g in GUIDES
    )
    hub_description = 'Guías prácticas y gratuitas para hacer un buen currículum: CV sin experiencia, CV compatible con filtros ATS y CV para estudiantes y titulados de FP.'
    hub_body = f'''        <h1>Guías para hacer un buen CV</h1>
        <p class="lead">Consejos prácticos y ejemplos para que tu currículum llegue a una persona y le convenza.</p>
        <ul class="cards">{cards}</ul>
{CTA.format(up='../')}'''
    (out_dir / 'index.html').write_text(page(
        title='Guías para hacer un buen CV', description=hub_description, path='guias/', body=hub_body, depth=1,
        breadcrumbs=[('ProCVX', '../'), ('Guías', None)],
        json_ld={'@context': 'https://schema.org', '@type': 'CollectionPage', 'name': 'Guías para hacer un buen CV',
                 'description': hub_description, 'inLanguage': 'es', 'url': SITE + 'guias/'},
    ), encoding='utf-8')

    sitemap = ['<?xml version="1.0" encoding="UTF-8"?>',
               '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    sitemap += [f'  <url><loc>{u}</loc><lastmod>{PUBLISHED}</lastmod></url>' for u in urls]
    sitemap.append('</urlset>')
    (ROOT / 'sitemap.xml').write_text('\n'.join(sitemap) + '\n', encoding='utf-8')
    print(f'Built {len(GUIDES)} guides + hub, sitemap with {len(urls)} URLs')


if __name__ == '__main__':
    build()
