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
PUBLISHED = '2026-11-22'  # default date; a guide can set its own 'published'
MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto',
          'septiembre', 'octubre', 'noviembre', 'diciembre']


def human_date(iso):
    y, m, d = (int(x) for x in iso.split('-'))
    return f'{d} de {MONTHS[m - 1]} de {y}'


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
    {
        'slug': 'carta-de-presentacion',
        'published': '2026-11-24',
        'title': 'Cómo hacer una carta de presentación (con ejemplo)',
        'short': 'Carta de presentación',
        'description': 'Cómo escribir una carta de presentación que se lea: estructura en cuatro párrafos, qué poner en cada uno, un ejemplo completo y los errores que hay que evitar.',
        'lead': 'Una carta de presentación no repite tu CV: explica por qué encajas en <em>ese</em> puesto y en <em>esa</em> empresa. Bien hecha, son cinco minutos de lectura que te diferencian de quien solo adjunta el currículum.',
        'body': '''
<nav class="toc" aria-label="Contenido">
  <strong>En esta guía</strong>
  <ol>
    <li><a href="#cuando">Cuándo enviarla</a></li>
    <li><a href="#estructura">La estructura en cuatro párrafos</a></li>
    <li><a href="#ejemplo">Ejemplo completo</a></li>
    <li><a href="#correo">Si la envías por correo</a></li>
    <li><a href="#errores">Errores frecuentes</a></li>
  </ol>
</nav>

<h2 id="cuando">1. Cuándo enviarla</h2>
<p>Envíala siempre que la oferta la pida y, además, en estos casos:</p>
<ul>
  <li><strong>Autocandidaturas:</strong> escribes a una empresa que no ha publicado ninguna oferta. Sin carta, nadie sabe qué puesto buscas.</li>
  <li><strong>Cambio de sector</strong> o un hueco en tu trayectoria que conviene explicar en una frase.</li>
  <li><strong>Ofertas con pocos candidatos</strong> o en empresas pequeñas, donde quien selecciona suele leerlo todo.</li>
</ul>
<p>En portales de empleo con un campo de “carta” opcional, unas pocas líneas personalizadas valen más que dejarlo vacío o pegar un texto genérico.</p>

<h2 id="estructura">2. La estructura en cuatro párrafos</h2>
<p>No hace falta más de una página; lo ideal son entre 200 y 300 palabras.</p>
<ol>
  <li><strong>Saludo y motivo.</strong> Dirígete a una persona si conoces su nombre. Di a qué puesto te presentas y dónde viste la oferta.</li>
  <li><strong>Por qué encajas.</strong> Elige dos o tres requisitos de la oferta y demuestra que los cumples con un dato o un logro concreto.</li>
  <li><strong>Por qué esa empresa.</strong> Una o dos frases que prueben que la conoces: un producto, un proyecto, su forma de trabajar.</li>
  <li><strong>Cierre.</strong> Disponibilidad, invitación a una entrevista y despedida.</li>
</ol>
<div class="compare">
  <div class="bad"><span class="label">Genérico</span>Me pongo en contacto con ustedes para ofrecerles mis servicios, ya que soy una persona trabajadora y con ganas de aprender.</div>
  <div class="good"><span class="label">Concreto</span>Le escribo por la oferta de Auxiliar Administrativo publicada en InfoJobs. Durante mis prácticas en una gestoría tramité más de 200 facturas al mes con A3, uno de los requisitos que piden.</div>
</div>

<h2 id="ejemplo">3. Ejemplo completo</h2>
<div class="example">
  <p>Estimada Sra. García:</p>
  <p>Le escribo para presentar mi candidatura al puesto de Dependienta en su tienda de Valencia, publicado en su web la semana pasada.</p>
  <p>Durante los dos últimos veranos he trabajado como dependienta en una tienda de deportes con más de 300 clientes al día, donde me encargaba de la caja, la reposición y los cambios y devoluciones. En temporada alta propuse reorganizar el probador con un sistema de turnos que redujo las colas en hora punta. Hablo inglés con fluidez (B2), algo útil en una zona con tanto turismo.</p>
  <p>Conozco su marca como clienta y me gusta especialmente el trato cercano que dan en tienda. Me encantaría aportar esa misma atención a su equipo.</p>
  <p>Tengo disponibilidad inmediata y horario flexible. Quedo a su disposición para una entrevista cuando le venga bien.</p>
  <p>Un saludo,<br>Laura Martínez · 600 123 456 · laura.martinez@email.com</p>
</div>

<h2 id="correo">4. Si la envías por correo</h2>
<ul>
  <li><strong>Asunto claro:</strong> “Candidatura Dependienta Valencia – Laura Martínez”.</li>
  <li>Puedes escribir la carta en el <strong>cuerpo del correo</strong> (más cómodo de leer) y adjuntar el CV en PDF.</li>
  <li>Revisa el nombre de la empresa y de la persona antes de enviar: es el error más fácil de cometer cuando reutilizas una carta.</li>
</ul>
<div class="tip"><p><strong>Consejo:</strong> asegúrate de que lo que cuentas en la carta aparece también en tu CV. Con ProCVX puedes ajustar el perfil y la experiencia a cada oferta y exportarlo a PDF en un minuto.</p></div>

<h2 id="errores">5. Errores frecuentes</h2>
<ul>
  <li>Empezar con “Muy señores míos” y una frase de relleno. Ve al grano desde la primera línea.</li>
  <li>Copiar tu CV en forma de párrafo. La carta elige y explica; no enumera.</li>
  <li>Hablar solo de lo que quieres tú (“busco crecer profesionalmente”) y no de lo que aportas.</li>
  <li>Usar la misma carta para todas las empresas. Se nota.</li>
</ul>
''',
    },
    {
        'slug': 'perfil-profesional-cv',
        'published': '2026-11-24',
        'title': 'Perfil profesional del CV: cómo escribirlo y 10 ejemplos',
        'short': 'Perfil profesional',
        'description': 'Cómo escribir el perfil profesional (o extracto) de tu currículum en tres frases, con una fórmula sencilla y 10 ejemplos para distintos puestos y niveles de experiencia.',
        'lead': 'El perfil profesional son las dos o tres líneas que van debajo de tu nombre. Es lo primero que se lee, así que tiene que responder rápido a una pregunta: ¿por qué debería seguir leyendo este CV?',
        'body': '''
<nav class="toc" aria-label="Contenido">
  <strong>En esta guía</strong>
  <ol>
    <li><a href="#formula">Una fórmula en tres frases</a></li>
    <li><a href="#ejemplos">10 ejemplos de perfil profesional</a></li>
    <li><a href="#adaptar">Cómo adaptarlo a cada oferta</a></li>
    <li><a href="#evitar">Qué evitar</a></li>
  </ol>
</nav>

<h2 id="formula">1. Una fórmula en tres frases</h2>
<ol>
  <li><strong>Quién eres:</strong> tu puesto o titulación y, si los tienes, los años de experiencia.</li>
  <li><strong>Qué sabes hacer:</strong> dos o tres especialidades, herramientas o un logro con número.</li>
  <li><strong>Qué buscas:</strong> el tipo de puesto o de empresa al que quieres llegar.</li>
</ol>
<p>Escríbelo en primera persona sin pronombre (“Técnica de laboratorio con…”) o en tercera persona, pero no mezcles las dos formas. Entre 40 y 70 palabras es suficiente.</p>
<div class="compare">
  <div class="bad"><span class="label">Genérico</span>Profesional proactivo, orientado a resultados y con capacidad de trabajo en equipo.</div>
  <div class="good"><span class="label">Concreto</span>Comercial con 6 años de experiencia en venta B2B de material industrial. Amplié la cartera de clientes de mi zona un 30 % en dos años. Busco un puesto de responsable de cuentas clave.</div>
</div>

<h2 id="ejemplos">2. 10 ejemplos de perfil profesional</h2>
<div class="example">
  <p><strong>Sin experiencia (recién titulado)</strong><br>
  Graduada en Marketing y Comunicación con prácticas en una agencia digital, donde gestioné las redes sociales de tres clientes. Manejo Meta Business Suite, Canva y Google Analytics. Busco mi primer puesto en un equipo de marketing digital.</p>
</div>
<div class="example">
  <p><strong>Estudiante de FP</strong><br>
  Estudiante de segundo curso de Técnico en Sistemas Microinformáticos y Redes (finalizo en junio de 2026). Experiencia en montaje de equipos y soporte a usuarios durante las prácticas. Disponible para jornada de tarde.</p>
</div>
<div class="example">
  <p><strong>Administración</strong><br>
  Administrativa con 5 años de experiencia en contabilidad y facturación para pymes. Dominio de A3, Excel avanzado y presentación de impuestos trimestrales. Busco estabilidad en un departamento financiero.</p>
</div>
<div class="example">
  <p><strong>Atención al cliente</strong><br>
  Teleoperador con 3 años en atención al cliente y resolución de incidencias para una operadora de telefonía, con una valoración media de 4,7/5. Inglés B2. Interesado en puestos de soporte de segundo nivel.</p>
</div>
<div class="example">
  <p><strong>Hostelería</strong><br>
  Camarera con 4 años de experiencia en sala y barra en restaurantes de hasta 120 cubiertos. Carné de manipulador de alimentos y conocimientos de coctelería. Busco un puesto estable en un restaurante o un hotel.</p>
</div>
<div class="example">
  <p><strong>Comercio</strong><br>
  Dependiente con experiencia en tiendas de moda y electrónica: caja, reposición, escaparatismo y venta asesorada. Superé el objetivo de ventas mensual en 9 de los últimos 12 meses.</p>
</div>
<div class="example">
  <p><strong>Logística</strong><br>
  Mozo de almacén con carné de carretillero y 7 años de experiencia en preparación de pedidos con radiofrecuencia y SGA. Acostumbrado a turnos rotativos y picos de campaña.</p>
</div>
<div class="example">
  <p><strong>Sanidad</strong><br>
  Técnica en Cuidados Auxiliares de Enfermería (TCAE) con 2 años en planta de medicina interna y experiencia en residencias. Formación en movilización de pacientes y en primeros auxilios.</p>
</div>
<div class="example">
  <p><strong>Tecnología</strong><br>
  Desarrollador web con 4 años de experiencia en JavaScript, React y Node.js. He liderado la migración de una tienda online con 50.000 usuarios mensuales. Busco un puesto en un equipo de producto.</p>
</div>
<div class="example">
  <p><strong>Cambio de sector</strong><br>
  Tras 8 años como profesor de secundaria, me he especializado en formación corporativa con un curso de diseño instruccional. Experiencia en preparar contenidos, hablar en público y evaluar resultados. Busco un puesto de formador en empresa.</p>
</div>

<h2 id="adaptar">3. Cómo adaptarlo a cada oferta</h2>
<p>El perfil es la parte del CV que más conviene cambiar entre una candidatura y otra:</p>
<ul>
  <li>Usa el <strong>mismo nombre de puesto</strong> que la oferta si encaja con tu experiencia.</li>
  <li>Destaca primero las herramientas o requisitos que la oferta menciona. Así también ayudas a pasar los <a href="../cv-ats/">filtros ATS</a>.</li>
  <li>Cambia la última frase (“qué buscas”) según el tipo de empresa.</li>
</ul>
<div class="tip"><p><strong>Consejo:</strong> en ProCVX guarda una copia de tu CV en JSON antes de adaptarlo. Así puedes tener una versión por sector y cargarla cuando la necesites.</p></div>

<h2 id="evitar">4. Qué evitar</h2>
<ul>
  <li>Adjetivos sin pruebas: “dinámico”, “proactivo”, “resolutivo”. Sustitúyelos por un hecho.</li>
  <li>Objetivos que solo hablan de ti (“busco desarrollarme”). Di qué aportas.</li>
  <li>Párrafos de más de cuatro líneas. Si no se lee de un vistazo, no se lee.</li>
  <li>Datos personales (edad, estado civil): no aportan y no hace falta incluirlos.</li>
</ul>
''',
    },
    {
        'slug': 'cv-hosteleria',
        'published': '2026-11-24',
        'title': 'CV para hostelería: camarero, cocina y recepción',
        'short': 'CV para hostelería',
        'description': 'Cómo hacer un currículum para hostelería: qué destacar si buscas trabajo de camarero, ayudante de cocina o recepcionista, ejemplos de funciones y qué carnés incluir.',
        'lead': 'En hostelería se contrata rápido y se lee rápido. Quien selecciona quiere saber en segundos dónde has trabajado, con qué volumen y si puedes empezar ya. Tu CV debe dejarlo claro de un vistazo.',
        'body': '''
<nav class="toc" aria-label="Contenido">
  <strong>En esta guía</strong>
  <ol>
    <li><a href="#basico">Lo que no puede faltar</a></li>
    <li><a href="#experiencia">Cómo describir la experiencia</a></li>
    <li><a href="#puestos">Ejemplos por puesto</a></li>
    <li><a href="#certificaciones">Carnés, cursos e idiomas</a></li>
    <li><a href="#sin-experiencia">Si es tu primer trabajo en hostelería</a></li>
  </ol>
</nav>

<h2 id="basico">1. Lo que no puede faltar</h2>
<ul>
  <li><strong>Teléfono visible</strong> arriba del todo. En hostelería se llama más que se escribe.</li>
  <li><strong>Disponibilidad:</strong> inmediata, fines de semana, temporada de verano, turno partido… Ponlo en el perfil.</li>
  <li><strong>Zona o ciudad</strong> y si tienes vehículo propio, sobre todo para horarios nocturnos.</li>
  <li><strong>Una página</strong>, con la experiencia más reciente primero.</li>
</ul>

<h2 id="experiencia">2. Cómo describir la experiencia</h2>
<p>“Camarero en el Bar X” no dice mucho. El tipo de local y el volumen de trabajo marcan la diferencia, porque no es lo mismo una cafetería tranquila que un restaurante con 200 cubiertos.</p>
<ul>
  <li>Tipo de local: cafetería, restaurante de menú, de carta, hotel, chiringuito, catering, eventos.</li>
  <li>Volumen: cubiertos por servicio, mesas a tu cargo, habitaciones del hotel.</li>
  <li>Funciones concretas y herramientas (TPV, PMS de hotel, comandas digitales).</li>
</ul>
<div class="compare">
  <div class="bad"><span class="label">Poco claro</span>Camarero. Atender mesas y servir bebidas.</div>
  <div class="good"><span class="label">Claro</span>Camarero de sala en restaurante de carta (90 cubiertos). Servicio de 6 mesas, recomendación de vinos, cobro en TPV y montaje de sala.</div>
</div>

<h2 id="puestos">3. Ejemplos por puesto</h2>
<div class="example">
  <p><strong>Camarero/a de sala o barra</strong><br>
  • Servicio de sala y barra en turnos de hasta 150 cubiertos.<br>
  • Preparación de cafés, combinados y coctelería básica.<br>
  • Gestión de comandas y cobros con TPV; cierre de caja.</p>
</div>
<div class="example">
  <p><strong>Ayudante de cocina</strong><br>
  • Mise en place, elaboración de guarniciones y emplatado en partida de fríos.<br>
  • Control de temperaturas y registros de APPCC.<br>
  • Recepción de mercancía, rotación de producto y limpieza de la cocina.</p>
</div>
<div class="example">
  <p><strong>Recepcionista de hotel</strong><br>
  • Check-in y check-out en un hotel de 4 estrellas con 120 habitaciones.<br>
  • Gestión de reservas en el PMS y en Booking.com.<br>
  • Atención a clientes en español, inglés y francés.</p>
</div>

<h2 id="certificaciones">4. Carnés, cursos e idiomas</h2>
<p>Ponlos en una sección propia de <strong>Certificaciones</strong>, que en este sector se mira mucho:</p>
<ul>
  <li><strong>Manipulador de alimentos</strong> (lo piden muchos locales para trabajar con comida).</li>
  <li>Alérgenos, APPCC, coctelería, barista o sumillería.</li>
  <li>Prevención de riesgos laborales.</li>
  <li><strong>Idiomas</strong> con nivel real: en zonas turísticas el inglés, el francés o el alemán pueden decidir la contratación.</li>
</ul>
<div class="tip"><p><strong>En ProCVX:</strong> la sección de Certificaciones muestra cada curso con la entidad y la fecha en la columna lateral, para que se vea sin quitar sitio a la experiencia.</p></div>

<h2 id="sin-experiencia">5. Si es tu primer trabajo en hostelería</h2>
<p>Las ganas y la disponibilidad cuentan mucho, pero también puedes demostrar que sabes tratar con gente y trabajar bajo presión:</p>
<ul>
  <li>Trabajos de atención al público (tienda, monitor de tiempo libre, eventos).</li>
  <li>Voluntariado en comedores, fiestas o asociaciones.</li>
  <li>Un curso de manipulador de alimentos: es corto y muestra interés.</li>
</ul>
<p>Más ideas en la guía para hacer un <a href="../cv-sin-experiencia/">CV sin experiencia</a>.</p>
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
    newest = max(g.get('published', PUBLISHED) for g in GUIDES)
    urls = [(SITE, PUBLISHED), (SITE + 'guias/', newest)]
    org = {'@type': 'Organization', 'name': 'ProCVX', 'url': SITE}

    for guide in GUIDES:
        path = f"guias/{guide['slug']}/"
        published = guide.get('published', PUBLISHED)
        related = ''.join(
            f'<li><a href="../{g["slug"]}/"><strong>{html.escape(g["title"])}</strong><span>{html.escape(g["description"])}</span></a></li>'
            for g in GUIDES if g is not guide
        )
        body = f'''        <article>
            <h1>{html.escape(guide['title'])}</h1>
            <p class="lead">{guide['lead']}</p>
            <p class="meta">Actualizado: <time datetime="{published}">{human_date(published)}</time></p>
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
                'inLanguage': 'es', 'datePublished': published, 'dateModified': published,
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
        urls.append((SITE + path, published))

    cards = ''.join(
        f'<li><a href="{g["slug"]}/"><strong>{html.escape(g["title"])}</strong><span>{html.escape(g["description"])}</span></a></li>'
        for g in GUIDES
    )
    hub_description = 'Guías prácticas y gratuitas para hacer un buen currículum: CV sin experiencia, filtros ATS, FP, hostelería, perfil profesional y carta de presentación.'
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
    sitemap += [f'  <url><loc>{u}</loc><lastmod>{d}</lastmod></url>' for u, d in urls]
    sitemap.append('</urlset>')
    (ROOT / 'sitemap.xml').write_text('\n'.join(sitemap) + '\n', encoding='utf-8')
    print(f'Built {len(GUIDES)} guides + hub, sitemap with {len(urls)} URLs')


if __name__ == '__main__':
    build()
