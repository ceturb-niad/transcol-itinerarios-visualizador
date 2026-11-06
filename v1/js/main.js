// Ponto de entrada da V1. MapLibre é módulo ES copiado em vendor/ (DEC-F02).
import * as maplibregl from '../vendor/maplibre-gl/maplibre-gl.mjs';
import { BASES } from './config.js';
import { criarMapa, baseDoErro } from './mapa.js';
import { criarControleBase } from './controle-base.js';
import { carregarItinerarios } from './dados.js';
import { iniciarAvisos, mostrarAviso } from './avisos.js';
import { falhaTiles, mensagensDeFalhas } from './mensagens.js';

console.info(`MapLibre GL JS ${maplibregl.getVersion()}`);

const controles = document.getElementById('controles');
const mapa = criarMapa(document.getElementById('mapa'));
criarControleBase(controles, mapa);
iniciarAvisos(controles);

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

// Mapa e controles não esperam a carga. `dados` será usado pela árvore (milestone 3).
const dados = await carregarItinerarios();
for (const { id, texto, persistente } of mensagensDeFalhas(dados.falhas)) {
  mostrarAviso(id, texto, { persistente });
}
