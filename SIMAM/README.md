# PILIBOT | Simulador del Sistema de Control

Sitio estático: HTML + CSS + JS puro, sin dependencias ni compilación. Es equivalente al archivo original: los CSS y JS concatenados en orden son idénticos byte por byte.

## Orden de carga (no cambiarlo)
Los estilos se cargan en este orden (la cascada depende de él):
- `css/01-tokens.css`
- `css/02-base.css`
- `css/03-buttons.css`
- `css/04-layout.css`
- `css/05-figures.css`
- `css/06-forms.css`
- `css/07-indicators.css`
- `css/08-tables-docs.css`
- `css/09-overrides.css`

Los scripts son clásicos (no módulos) y comparten variables globales, así que deben ir en este orden:
- `js/00-utils.js`
- `js/01-world-terrain.js`
- `js/02-robot-state.js`
- `js/03-program-parser.js`
- `js/04-simulation-step.js`
- `js/05-charts.js`
- `js/06-montecarlo.js`
- `js/07-export-cases.js`
- `js/08-docs-dialog.js`
- `js/09-analysis.js`
- `js/10-glossary-html.js`
- `js/11-glossary-logic.js`
- `js/12-program-sim.js`
- `js/13-save-load.js`
- `js/14-maneuvers-explain.js`
- `js/15-block-diagrams.js`
- `js/16-planning.js`
- `js/17-polygon-reference.js`
- `js/18-warehouse-scenarios.js`
- `js/19-warehouse-routes-main.js`

## Publicar en GitHub Pages
1. Sube el contenido de esta carpeta a la raíz de la rama `main` de un repositorio.
2. Settings → Pages → Deploy from a branch → `main` / `(root)` → Save.
3. Abre `https://TU-USUARIO.github.io/TU-REPO/`.

También funciona abriendo `index.html` con doble clic.
