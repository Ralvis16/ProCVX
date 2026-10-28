# Librerías de terceros (alojadas localmente)

| Librería | Versión | Licencia | Archivo |
|---|---|---|---|
| [Lucide](https://lucide.dev) | 1.63.0 | ISC | `lucide.min.js` |
| [SortableJS](https://sortablejs.github.io/Sortable/) | 1.15.7 | MIT | `Sortable.min.js` |

Se sirven desde el propio sitio (sin CDN) para que la web no haga peticiones a terceros
y para que una actualización externa no pueda romperla. Para actualizarlas, descarga la nueva
versión desde npm (`npm pack lucide sortablejs`) y reemplaza los archivos.
