// Valores variáveis da V1 (DEC-F10, DEC-F11). Nada disso fica na lógica.

// Vista inicial: município de Vitória. [Provisório] (DEC-F11): o humano ajusta olhando o mapa.
export const VISTA_INICIAL = {
  centro: [-40.32, -20.31], // [longitude, latitude]
  zoom: 11,
};

// Bases do mapa. Fontes: política de tiles da OSMF
// (https://operations.osmfoundation.org/policies/tiles/), lida em 06/11/2026.
export const BASES = {
  osm: {
    nome: 'OpenStreetMap',
    tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
    tileSize: 256,
    atribuicao:
      '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
    // [Sem fonte] A política e a wiki do OSM não informam o zoom máximo da camada padrão.
    // null = usa o padrão do MapLibre (22) até haver valor verificado na fonte oficial.
    zoomMaximo: null,
  },
};

export const BASE_INICIAL = 'osm';
