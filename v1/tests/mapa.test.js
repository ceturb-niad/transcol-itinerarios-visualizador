import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BASES, BASE_INICIAL, VISTA_INICIAL } from '../js/config.js';
import { montarEstilo } from '../js/mapa.js';

test('vista inicial válida', () => {
  const [lng, lat] = VISTA_INICIAL.centro;
  assert.ok(lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90);
  assert.ok(VISTA_INICIAL.zoom >= 0);
});

test('bases: tiles https com {z}/{x}/{y} e atribuição', () => {
  assert.ok(BASE_INICIAL in BASES);
  for (const base of Object.values(BASES)) {
    for (const url of base.tiles) {
      assert.match(url, /^https:\/\//);
      for (const p of ['{z}', '{x}', '{y}']) assert.ok(url.includes(p));
    }
    assert.ok(base.atribuicao.length > 0);
    if (base.zoomMaximo != null) assert.ok(VISTA_INICIAL.zoom <= base.zoomMaximo);
  }
});

test('estilo: só rasters, sem texto e sem itinerário; só a base inicial visível', () => {
  const e = montarEstilo(BASES, BASE_INICIAL);
  assert.equal(e.version, 8);
  assert.equal(e.glyphs, undefined);
  assert.equal(e.layers.length, Object.keys(BASES).length);
  for (const l of e.layers) assert.equal(l.type, 'raster');
  for (const s of Object.values(e.sources)) assert.equal(s.type, 'raster');
  const visiveis = e.layers.filter((l) => l.layout.visibility === 'visible');
  assert.equal(visiveis.length, 1);
  assert.equal(visiveis[0].id, `base-${BASE_INICIAL}`);
});

import { alternarBase } from '../js/mapa.js';

test('bases: pelo menos OSM e satélite, com zoom máximo coerente', () => {
  assert.ok('osm' in BASES && 'satelite' in BASES);
  assert.equal(BASES.satelite.chave, null);
  assert.ok(BASES.satelite.zoomMaximo >= VISTA_INICIAL.zoom);
});

test('alternarBase deixa só uma camada visível e não toca em fontes', () => {
  const chamadas = [];
  const mapa = { setLayoutProperty: (...a) => chamadas.push(a) };
  assert.equal(alternarBase(mapa, BASES, 'satelite'), true);
  assert.equal(chamadas.length, Object.keys(BASES).length);
  const visiveis = chamadas.filter(([, prop, v]) => prop === 'visibility' && v === 'visible');
  assert.deepEqual(visiveis.map((c) => c[0]), ['base-satelite']);
  assert.equal(alternarBase(mapa, BASES, 'inexistente'), false);
});
