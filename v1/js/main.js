// Ponto de entrada da V1. MapLibre é módulo ES copiado em vendor/ (DEC-F02).
import * as maplibregl from '../vendor/maplibre-gl/maplibre-gl.mjs';
import { criarMapa } from './mapa.js';
import { criarControleBase } from './controle-base.js';

console.info(`MapLibre GL JS ${maplibregl.getVersion()}`);

const mapa = criarMapa(document.getElementById('mapa'));
criarControleBase(document.getElementById('controles'), mapa);
