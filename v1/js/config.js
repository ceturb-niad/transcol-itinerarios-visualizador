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
  // [Provisório] (DEC-F10). Fonte: página do serviço World_Imagery
  // (https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer),
  // lida em 06/11/2026: tiles 256 px JPEG, Web Mercator; atribuição = "Copyright Text" do serviço.
  // A ordem {z}/{y}/{x} e o zoom máximo foram medidos com tiles de Vitória em 06/11/2026.
  // Termos de uso sem chave e parecer de licença: sem fonte lida; seguem em aberto.
  satelite: {
    nome: 'Satélite (Esri)',
    tiles: ['https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
    tileSize: 256,
    atribuicao: 'Source: Esri, Vantor, Earthstar Geographics, and the GIS User Community',
    // O serviço declara até o nível 23, mas em Vitória os níveis 20 a 23 devolvem o tile "sem dados".
    zoomMaximo: 19,
    chave: null, // opção 2 (ArcGIS Location Platform), se a opção 1 for abandonada (DEC-F10)
  },
};

export const BASE_INICIAL = 'osm';

// Dados: arquivos estáticos de outro repositório, por isso URL absoluta (DEC-F13, DEC-002).
export const DADOS = {
  urlBase: 'https://ceturb-niad.github.io/transcol-itinerarios-dados/',
  manifesto: 'manifest.json',
  geojson: 'itinerarios.geojson',
};
