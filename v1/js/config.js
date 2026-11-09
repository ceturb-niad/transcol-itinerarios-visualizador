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

// Cores das features (DEC-F18, DEC-F21). Paleta na ordem da especificação.
export const CORES = {
  paleta: ['#E6194B', '#0072F0', '#FFB000', '#00B050', '#9B30FF', '#00C8D7', '#FF6F00', '#D81B9A', '#8BC34A', '#6A5ACD'],
  anguloAureo: 137.508,
  // [Provisório] (DEC-F21): saturação e luminosidade das cores acima da paleta.
  hslExcedente: { saturacao: 65, luminosidade: 42 },
};

// Desenho dos itinerários ligados (DEC-F21). [Provisório]: contorno escuro semitransparente
// sob a linha colorida, para ler sobre as duas bases.
export const ITINERARIOS = {
  contorno: { largura: 5, cor: '#000000', opacidade: 0.45 },
  linha: { largura: 3 },
};

// Caixa lateral (DEC-F11). [Provisório]: a largura também alimenta o padding do enquadramento.
export const CAIXA_LATERAL = { largura: 320, folga: 10 };

// Clique no mapa: tolerância, em pixels, ao redor do ponto clicado (linhas de 3 px são difíceis de acertar).
// [Provisório]: ajustar olhando o mapa.
export const CLIQUE = { tolerancia: 4 };

// Enquadramento ao ligar (DEC-F24). [Provisório]: ajustar olhando o mapa. A folga esquerda vem da
// caixa lateral medida (CAIXA_LATERAL.folga + largura medida + folga); estas são as dos outros lados.
// `larguraMinima`: largura que deve sobrar ao traçado, para o padding nunca consumir o mapa todo.
export const ENQUADRAMENTO = {
  zoomMaximo: 16,
  folga: { topo: 60, direita: 40, baixo: 40, esquerda: 10 },
  larguraMinima: 200,
};
