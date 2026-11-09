// Popup ao clicar numa feature ligada (DEC-F09, DEC-F28). Só abre ao clique, nunca ao passar o mouse.
import * as maplibregl from '../vendor/maplibre-gl/maplibre-gl.mjs';
import { CAMADAS } from './mapa-itinerarios.js';
import { CLIQUE } from './config.js';
import { TEXTOS } from './mensagens.js';
import { indicePorChave, itensDoPopup } from './popup.js';

function conteudo(itens) {
  const raiz = document.createElement('div');
  raiz.className = 'popup-itens';
  for (const { nome, linha, grupo } of itens) {
    const item = document.createElement('div');
    item.className = 'popup-item';
    const titulo = document.createElement('strong');
    titulo.textContent = nome;
    const detalhe = document.createElement('div');
    detalhe.textContent = `${TEXTOS.rotuloLinha} ${linha} · ${TEXTOS.rotuloGrupo} ${grupo}`;
    item.append(titulo, detalhe);
    raiz.append(item);
  }
  return raiz;
}

export function criarPopup(mapa, geojson, selecao) {
  const porChave = indicePorChave(geojson);
  const popup = new maplibregl.Popup({ closeOnClick: false, maxWidth: '320px' });
  let exibidas = [];

  mapa.on('click', (e) => {
    const { x, y } = e.point;
    const t = CLIQUE.tolerancia;
    const achadas = mapa.queryRenderedFeatures(
      [[x - t, y - t], [x + t, y + t]],
      { layers: CAMADAS },
    );
    // As camadas só desenham as features ligadas, então o resultado já é "ligadas sob o clique".
    const itens = itensDoPopup(achadas.map((f) => f.properties.chave), porChave);
    if (!itens.length) {
      popup.remove();
      return;
    }
    exibidas = itens.map((i) => i.chave);
    popup.setLngLat(e.lngLat).setDOMContent(conteudo(itens)).addTo(mapa);
  });

  for (const id of CAMADAS) {
    mapa.on('mouseenter', id, () => { mapa.getCanvas().style.cursor = 'pointer'; });
    mapa.on('mouseleave', id, () => { mapa.getCanvas().style.cursor = ''; });
  }

  // Feature listada que é desligada fecha o popup; ligar outras não o fecha.
  selecao.aoMudar(() => {
    if (popup.isOpen() && exibidas.some((c) => !selecao.estaLigada(c))) popup.remove();
  });
}
