// Desenho dos itinerários ligados: uma fonte GeoJSON e duas camadas (contorno escuro e linha
// colorida), filtradas por `chave` (DEC-F07, DEC-F21). Sem camada de texto (DEC-F12).
import { ITINERARIOS } from './config.js';

const FONTE = 'itinerarios';
const CAMADAS = ['itinerarios-contorno', 'itinerarios-linha'];

// Filtro que seleciona só as chaves dadas; sem chave, não casa nada (mapa vazio).
export function filtroPorChaves(chaves) {
  const lista = [...chaves];
  return lista.length ? ['in', ['get', 'chave'], ['literal', lista]] : ['==', ['get', 'chave'], ''];
}

// Adiciona fonte e camadas acima das bases, sem nenhuma feature visível. Devolve
// `aplicarSelecao(chaves)`; chamadas anteriores ao fim do carregamento do estilo valem depois dele.
export function adicionarItinerarios(mapa, geojson) {
  let pronto = false;
  let pendente = [];
  const montar = () => {
    mapa.addSource(FONTE, { type: 'geojson', data: geojson });
    const layout = { 'line-cap': 'round', 'line-join': 'round' };
    mapa.addLayer({
      id: CAMADAS[0],
      type: 'line',
      source: FONTE,
      filter: filtroPorChaves([]),
      layout,
      paint: {
        'line-color': ITINERARIOS.contorno.cor,
        'line-opacity': ITINERARIOS.contorno.opacidade,
        'line-width': ITINERARIOS.contorno.largura,
      },
    });
    mapa.addLayer({
      id: CAMADAS[1],
      type: 'line',
      source: FONTE,
      filter: filtroPorChaves([]),
      layout,
      paint: { 'line-color': ['get', '_cor'], 'line-width': ITINERARIOS.linha.largura },
    });
    pronto = true;
    aplicar(pendente);
  };
  const aplicar = (chaves) => {
    if (!pronto) {
      pendente = [...chaves];
      return;
    }
    const filtro = filtroPorChaves(chaves);
    for (const id of CAMADAS) mapa.setFilter(id, filtro);
  };
  if (mapa.isStyleLoaded()) montar();
  else mapa.once('load', montar);
  return aplicar;
}
