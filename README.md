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
*   **Tres Estructuras (Plantillas):** **Moderno** (dos columnas), **Minimalista** (una columna, cabecera centrada) y **Clásico** (tipografía con serifa).
*   **Secciones Flexibles:** Activa o desactiva secciones enteras (Sobre mí, Experiencia, Proyectos, Educación, Habilidades, Tecnología o Idiomas) con los *checkboxes* de las cabeceras, y reordénalas arrastrándolas o con las flechas.
*   **Descripciones con Viñetas y Texto Justificado:** Las descripciones de experiencia y proyectos se muestran justificadas, y las líneas con viñeta (`•`) llevan sangría francesa para que el texto quede alineado.
*   **Foto de Perfil Optimizada:** La imagen se reduce automáticamente (máx. 400 px, JPEG) para que ocupe poco en el navegador y en los archivos exportados.
*   **Importar / Exportar JSON:** Guarda tu currículum en un archivo y cárgalo cuando quieras, en este u otro dispositivo.
*   **Impresión A4:** Márgenes físicos de página (`@page { margin: 18mm 16mm; }`) y bloques que no se parten entre páginas (`break-inside: avoid`), para una exportación a PDF limpia.
*   **Confirmaciones Seguras:** El botón de limpiar datos usa un modal propio, sin depender de los pop-ups del navegador.
*   **Interfaz Bilingüe (ES / EN):** Textos, ejemplos, avisos y niveles de idioma se traducen en tiempo real.
*   **Persistencia Local Automática:** El progreso, el tema, la plantilla y el orden de las secciones se guardan en el `localStorage` del navegador.
*   **Datos de Ejemplo:** En la primera visita se cargan datos de ejemplo (en el idioma elegido); el botón **Ejemplo** permite recargarlos.
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
├── utils.js            # Utilidades de texto y niveles de idiomas
├── ui.js               # Integración segura con Lucide
├── i18n.js              # Diccionario de traducciones ES / EN
├── config.js            # Configuración global y claves de almacenamiento
├── fonts/              # Tipografías alojadas (fonts.css + files/*.woff2) y licencias
├── vendor/             # Lucide y SortableJS alojados, con sus licencias
├── LICENSE
└── README.md
```

> Al actualizar `style.css` o cualquier archivo JavaScript, sube también el número `?v=` de sus etiquetas en `index.html` para que el navegador no use copias antiguas en caché.
