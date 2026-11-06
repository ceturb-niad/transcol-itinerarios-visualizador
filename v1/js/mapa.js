// Criação do mapa. Sem camadas de texto e sem servidor de fontes (DEC-F12).
import * as maplibregl from '../vendor/maplibre-gl/maplibre-gl.mjs';
import { BASES, BASE_INICIAL, VISTA_INICIAL } from './config.js';

// Estilo MapLibre com uma fonte raster e uma camada por base; só a inicial fica visível.
// Alternar a base é alternar `visibility`, sem trocar o estilo (especificação 4.10).
export function montarEstilo(bases, baseInicial) {
  const sources = {};
  const layers = [];
  for (const [id, base] of Object.entries(bases)) {
    const fonte = {
      type: 'raster',
      tiles: base.tiles,
      tileSize: base.tileSize,
      attribution: base.atribuicao,
    };
    if (base.zoomMaximo != null) fonte.maxzoom = base.zoomMaximo;
    sources[`base-${id}`] = fonte;
    layers.push({
      id: `base-${id}`,
      type: 'raster',
      source: `base-${id}`,
      layout: { visibility: id === baseInicial ? 'visible' : 'none' },
    });
  }
  return { version: 8, sources, layers };
}

export function criarMapa(container) {
  return new maplibregl.Map({
    container,
    style: montarEstilo(BASES, BASE_INICIAL),
    center: VISTA_INICIAL.centro,
    zoom: VISTA_INICIAL.zoom,
    // compact:false mantém a atribuição expandida, nunca atrás de botão (política do OSM).
    attributionControl: { compact: false },
  });
}
