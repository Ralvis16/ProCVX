# Librerías de terceros (alojadas localmente)

| Librería | Versión | Licencia | Archivo |
|---|---|---|---|
| [Lucide](https://lucide.dev) | 1.63.0 | ISC | `icons.js` (solo los iconos usados) |
| [SortableJS](https://sortablejs.github.io/Sortable/) | 1.15.7 | MIT | `Sortable.min.js` |

Se sirven desde el propio sitio (sin CDN) para que una actualización externa no pueda romper la web.

**Iconos:** `icons.js` se genera con `node tools/build-icons.js` a partir de la librería completa
(`tools/lucide.min.js`, que no se publica) e incluye solo los iconos que aparecen como
`data-lucide="..."` en el código: unos 8 KB en lugar de ~460 KB. Al usar un icono nuevo, vuelve a
ejecutar el script. Para actualizar Lucide, reemplaza `tools/lucide.min.js` (`npm pack lucide`) y
regenera `icons.js`. SortableJS se actualiza reemplazando `Sortable.min.js`.
