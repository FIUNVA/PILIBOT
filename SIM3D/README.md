# PILIBOT | Simulador 3D

Sitio estático (HTML + CSS + JS puro, sin compilación).

## Publicar en GitHub Pages
1. Crea un repositorio y sube **todo el contenido** de esta carpeta (incluido `.nojekyll`).
2. En GitHub: *Settings → Pages → Source: Deploy from a branch → main / (root)*.
3. Abre `https://TU_USUARIO.github.io/TU_REPO/`.

Para probar localmente: `python3 -m http.server` y abre http://localhost:8000
(también funciona abriendo `index.html` directamente).

## Estructura
- `index.html` — solo la estructura de la interfaz.
- `css/` — estilos separados por área (base, pestañas de análisis, dock, mejoras de UI, mando).
- `data/` — geometrías del modelo (`parts-a.js`, `parts-b.js`) e índice de imágenes.
- `assets/img/` — imágenes usadas en la documentación.
- `js/core/` — decodificación, escena, estado, cámara, ejes.
- `js/geometry/` — OLED, bandas, chasis.
- `js/ui/` — pestañas/dock, controles, árbol de cuerpos.
- `js/features/` — ruedas, explosión, motores, LED, ojos, editor de dibujo, escenario.
- `js/analysis/` — solver, voxelización, superposición, viento, aerodinámica, estructura.
- `js/docs/` — planos tipo SolidWorks y generador de la documentación.
- `js/viewers/` — visor 3D de planos, componentes/STEP, Figura 4, directrices.
- `js/main.js` — arranque y bucle de render.

**Importante:** los scripts comparten variables globales y deben cargarse en el orden de `index.html`.
`parts-b.js` pesa ~28 MB (por debajo del límite de 100 MB de GitHub).
