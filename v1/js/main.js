// Ponto de entrada da V1. MapLibre é módulo ES copiado em vendor/ (DEC-F02).
import * as maplibregl from '../vendor/maplibre-gl/maplibre-gl.mjs';
import { BASES, CAIXA_LATERAL, ENQUADRAMENTO } from './config.js';
import { criarMapa, baseDoErro } from './mapa.js';
import { criarControleBase } from './controle-base.js';
import { carregarItinerarios } from './dados.js';
import { iniciarAvisos, mostrarAviso } from './avisos.js';
import { falhaTiles, mensagensDeFalhas } from './mensagens.js';
import { construirModelo } from './arvore.js';
import { anexarCores } from './cores.js';
import { criarArvore } from './arvore-ui.js';
import { criarSelecao } from './selecao.js';
import { adicionarItinerarios } from './mapa-itinerarios.js';
import { criarAcoes } from './acoes-ui.js';
import { criarBusca } from './busca-ui.js';
import { criarPopup } from './popup-ui.js';
import { criarDatas } from './datas-ui.js';
import { limitesDe, paddingDe } from './enquadramento.js';

console.info(`MapLibre GL JS ${maplibregl.getVersion()}`);

const controles = document.getElementById('controles');
const mapa = criarMapa(document.getElementById('mapa'));
criarControleBase(controles, mapa);
iniciarAvisos(controles);

// Caixa lateral sobreposta ao mapa (DEC-F11); a árvore entra quando os dados chegam.
const caixaLateral = document.createElement('aside');
caixaLateral.className = 'caixa-lateral';
caixaLateral.setAttribute('aria-label', 'Linhas');
controles.append(caixaLateral);

// Falha de tiles de uma base: um aviso por base, mesmo com muitos tiles falhando (DEC-F15).
mapa.on('error', (evento) => {
  const base = baseDoErro(evento, BASES);
  if (base === null) {
    console.error(evento.error ?? evento);
    return;
  }
  console.warn(`Falha de tile na base ${base}:`, evento.error);
  mostrarAviso(`tiles-${base}`, falhaTiles(BASES[base].nome));
});

// Mapa e controles não esperam a carga.
const dados = await carregarItinerarios();
for (const { id, texto, persistente } of mensagensDeFalhas(dados.falhas)) {
  mostrarAviso(id, texto, { persistente });
}

// Datas só com manifesto íntegro; sem ele o aviso persistente já ocupa o lugar (DEC-F25).
if (dados.manifesto) criarDatas(document.getElementById('datas'), dados.manifesto);

// Sem GeoJSON a árvore fica vazia, com a mensagem já exibida (DEC-F25).
if (dados.geojson) {
  const modelo = anexarCores(construirModelo(dados.geojson));
  const selecao = criarSelecao();
  const aplicarSelecao = adicionarItinerarios(mapa, dados.geojson);
  selecao.aoMudar(aplicarSelecao);
  criarPopup(mapa, dados.geojson, selecao);
  // Enquadra só ao ligar (DEC-F24); desligar e limpar não passam por aqui.
  selecao.aoLigar((chaves) => {
    const limites = limitesDe(chaves.map((c) => modelo.features.get(c)));
    if (!limites) return;
    const padding = paddingDe(
      caixaLateral.getBoundingClientRect().width,
      window.innerWidth,
      ENQUADRAMENTO,
      CAIXA_LATERAL.folga,
    );
    mapa.fitBounds(limites, { padding, maxZoom: ENQUADRAMENTO.zoomMaximo });
  });
  // Modo de medição (4.3 T2): só com ?medir na URL; não afeta o uso normal.
  if (new URLSearchParams(location.search).has('medir')) {
    const { prepararMedicao } = await import('./medicao.js');
    prepararMedicao(mapa, dados.geojson, aplicarSelecao);
  }
  const campoBusca = criarBusca(caixaLateral, modelo, criarArvore(caixaLateral, modelo, selecao));
  criarAcoes(caixaLateral, modelo, selecao, campoBusca);
}
