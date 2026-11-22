# ProCVX - Creador de Currículum Profesional

Una aplicación web moderna e interactiva para crear currículums profesionales listos para imprimir en formato **A4**. Pensada para cualquier tipo de público que busque una presentación de su perfil limpia, minimalista y de alto impacto visual.

---

## ✨ Características Principales

*   **Edición en Tiempo Real:** Visualiza cómo se va estructurando tu currículum mientras escribes en los formularios.
*   **Temas de Color:** Elige entre 4 esquemas cromáticos con un clic:
    *   💧 **Sapphire** (Azul corporativo)
    *   ⚡ **Cyberpunk** (Tonos neón y futuristas)
    *   🌲 **Emerald** (Verde menta sofisticado)
    *   ❄️ **Nordic** (Tonos fríos y sobrios)
*   **Tres Estructuras (Plantillas):** **Moderno** (dos columnas), **Minimalista** (una columna, cabecera centrada; la más recomendable para los filtros automáticos **ATS** de las empresas) y **Clásico** (tipografía con serifa).
*   **Secciones Flexibles:** Activa o desactiva secciones enteras (Perfil, Experiencia, Proyectos, Voluntariado, Formación, Certificaciones, Habilidades, Tecnología o Idiomas) con los *checkboxes* de las cabeceras, y reordénalas arrastrándolas o con las flechas.
*   **Descripciones con Viñetas y Texto Justificado:** Las descripciones de experiencia y proyectos se muestran justificadas, y las líneas con viñeta (`•`) llevan sangría francesa para que el texto quede alineado.
*   **Foto de Perfil Optimizada:** La imagen se reduce automáticamente (máx. 400 px, JPEG) para que ocupe poco en el navegador y en los archivos exportados.
*   **Importar / Exportar JSON:** Guarda tu currículum en un archivo y cárgalo cuando quieras, en este u otro dispositivo.
*   **Impresión A4:** Márgenes físicos de página (`@page { margin: 18mm 16mm; }`) y bloques que no se parten entre páginas (`break-inside: avoid`), para una exportación a PDF limpia.
*   **Confirmaciones y Avisos Propios:** Limpiar datos pide confirmación en un diálogo accesible, y los mensajes (importación, errores de foto, etc.) se muestran como avisos discretos en lugar de `alert()`.
*   **Indicador de Progreso:** Una barra muestra qué porcentaje del CV está completo y qué datos esenciales faltan (solo cuenta las secciones activadas).
*   **Uso en Móvil:** En pantallas estrechas un selector inferior alterna entre **Editar** y **Vista previa**; la hoja A4 se escala para caber en pantalla sin deformar el diseño real.
*   **Accesible con Teclado:** Los selectores de tema, estructura e idioma funcionan con flechas, `Enter` y `Esc`, y los diálogos gestionan el foco correctamente.
*   **Interfaz Bilingüe (ES / EN):** Textos, ejemplos, avisos y niveles de idioma se traducen en tiempo real.
*   **Persistencia Local Automática:** El progreso, el tema, la plantilla y el orden de las secciones se guardan en el `localStorage` del navegador (con un pequeño retardo mientras escribes, y siempre al cerrar o cambiar de pestaña). Si el navegador no puede guardar (p. ej. por espacio), se avisa al usuario.
*   **Datos de Ejemplo:** En la primera visita se cargan datos de ejemplo coherentes (en el idioma elegido) que caben en una página; el botón **Ejemplo** permite recargarlos. Tras **Limpiar**, el CV queda vacío aunque recargues la página.
*   **Certificaciones y Voluntariado:** Secciones propias para certificaciones o cursos (nombre, entidad y fecha, en la columna lateral) y para voluntariado (rol, organización, fechas y logros con viñetas, en la columna principal). Si ya tenías un orden de secciones guardado, las nuevas se colocan en su sitio natural.
*   **Funciona sin Conexión (PWA):** Tras la primera visita desde la web publicada, un *service worker* guarda los archivos de la aplicación, así que se puede abrir y usar sin internet. También se puede instalar como app desde el navegador. La copia en caché no contiene datos del usuario.
*   **Privacidad Real:** Todo se procesa en tu navegador. Librerías, iconos y tipografías se alojan en el propio proyecto: no se hacen peticiones a servidores de terceros.

---

## 🛠️ Tecnologías Utilizadas

*   **HTML5** semántico.
*   **CSS3** (variables nativas, glassmorphism, Grid y Flexbox).
*   **JavaScript Vanilla** (modular y defensivo).
*   **[Lucide](https://lucide.dev)** 1.63.0 (iconos SVG) y **[SortableJS](https://sortablejs.github.io/Sortable/)** 1.15.7 (arrastrar secciones), alojadas en `vendor/`.
*   Tipografías **Outfit**, **Plus Jakarta Sans** y **JetBrains Mono** (licencia OFL), alojadas en `fonts/`.

---

## 🏗️ Arquitectura y Clean Code

*   **Modularidad en JS:** `script.js` coordina la aplicación y delega persistencia, utilidades de texto e integración visual en módulos independientes.
*   **Factory Pattern:** Los bloques dinámicos del editor (experiencias, idiomas, etc.) se crean con funciones de fábrica.
*   **Seguridad:** Todo texto del usuario se escapa antes de insertarse en el HTML (también al importar un JSON).
*   **Carga en bloque:** Al cargar muchos elementos (ejemplo o datos guardados) la interfaz se refresca una sola vez.
*   **CSS Estructurado:** Estilos separados de la estructura y selectores semánticos.

---

## 🚀 Cómo Ejecutar el Proyecto en Local

La aplicación es estática; solo necesita un servidor HTTP básico:

### Opción 1: Servidor rápido con Python
```bash
python3 -m http.server 8080
```
Luego abre [http://localhost:8080](http://localhost:8080).

### Opción 2: VS Code - Live Server
Instala la extensión **Live Server** y pulsa **Go Live** en la barra inferior.

---

## 📄 Guía de Exportación a PDF / Impresión

1.  Pulsa **Imprimir PDF** en la esquina superior derecha.
2.  En el diálogo de impresión:
    *   **Destino:** Guardar como PDF.
    *   **Diseño:** Vertical. **Tamaño de papel:** A4.
    *   **Márgenes:** Predeterminado (el diseño ya gestiona los márgenes de 18 mm × 16 mm).
    *   ⚠️ Desmarca **"Encabezados y pies de página"** para que no aparezcan la fecha, la URL o el título.
    *   Activa **"Gráficos de fondo"** si quieres que se exporten los colores del tema.

---

## 📁 Estructura de Archivos

```
ProCVX/
├── index.html          # Estructura (paneles de editor y vista previa)
├── style.css           # Estilos, temas, plantillas y reglas de impresión
├── script.js           # Coordinación, renderizado, formularios dinámicos e i18n
├── storage.js          # Persistencia segura y análisis de JSON
├── utils.js            # Utilidades de texto, URLs seguras y debounce
├── ui.js               # Integración con Lucide y avisos (toasts)
├── i18n.js             # Diccionario de traducciones ES / EN
├── sample-data.js      # CV de ejemplo (ES / EN), mismo formato que el JSON exportado
├── config.js           # Configuración global y claves de almacenamiento
├── sw.js               # Service worker (modo sin conexión)
├── _headers            # Cabeceras HTTP para Cloudflare Pages (caché y seguridad)
├── manifest.webmanifest # Datos para instalar la app (PWA)
├── icons/              # Iconos PNG de la app (192, 512 y maskable)
├── favicon.svg         # Icono de la pestaña
├── og-image.png        # Imagen al compartir el enlace (1200×630)
├── tests/              # Tests unitarios y end-to-end (Playwright)
├── tools/              # bump-version.js (versiones de caché)
├── fonts/              # Tipografías alojadas (fonts.css + files/*.woff2) y licencias
├── vendor/             # Lucide y SortableJS alojados, con sus licencias
├── LICENSE
└── README.md
```

> Al actualizar `style.css` o cualquier archivo JavaScript, ejecuta `node tools/bump-version.js` (o `npm run bump`): sube a la vez todos los `?v=` de `index.html` para que el navegador no use copias antiguas en caché.

> **Modo sin conexión:** si añades un archivo nuevo que la app necesite (otro `.js`, una fuente...), inclúyelo en la lista `APP_SHELL` de `sw.js` y sube el número de `CACHE_NAME`. El service worker solo funciona servido por `http(s)` (no abriendo `index.html` como archivo).

> **Publicación:** la web oficial es https://procvx.com (Cloudflare Pages, desplegada desde la rama `main`). Esa URL figura en las etiquetas `og:url`, `og:image`, `twitter:image` y `canonical` de `index.html`; si cambia el dominio, actualízalas. El archivo `_headers` indica a Cloudflare que no guarde en caché `index.html` ni `sw.js` (así las actualizaciones llegan al momento) y añade cabeceras de seguridad básicas.

---

## 🧪 Tests

```bash
npm install
npm test
```

*   `tests/utils.test.js`: tests unitarios de las utilidades, traducciones y datos de ejemplo (solo Node).
*   `tests/e2e.test.js`: abre la app en Chromium con Playwright y prueba edición, guardado, importar/exportar, idiomas, teclado, móvil, certificaciones y voluntariado, la exportación a PDF (comprueba que el ejemplo cabe en una página A4 en los dos idiomas) y el modo sin conexión (levanta un servidor local y recarga la app sin red). Necesita `pdfinfo`/`pdftotext` (poppler-utils) y un Chromium para Playwright (`npx playwright install chromium`).
