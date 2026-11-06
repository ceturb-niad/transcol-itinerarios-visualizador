import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TEXTOS, falhaTiles, mensagensDeFalhas } from '../js/mensagens.js';
import { BASES } from '../js/config.js';
import { baseDoErro } from '../js/mapa.js';

const ids = (f) => mensagensDeFalhas(f).map((m) => m.id);

test('sem falhas: nenhuma mensagem', () => {
  assert.deepEqual(mensagensDeFalhas({ manifesto: null, geojson: null }), []);
});

test('manifesto falho: mensagem de falha e aviso persistente de datas', () => {
  const m = mensagensDeFalhas({ manifesto: new Error('x'), geojson: null });
  assert.deepEqual(m.map((a) => a.id), ['falha-manifesto', 'datas-indisponiveis']);
  assert.equal(m[0].texto, TEXTOS.falhaManifesto);
  assert.equal(m[0].persistente, false);
  assert.equal(m[1].texto, 'Datas de atualização indisponíveis');
  assert.equal(m[1].persistente, true);
});

test('GeoJSON falho: só a mensagem do GeoJSON, sem aviso de datas', () => {
  assert.deepEqual(ids({ manifesto: null, geojson: new Error('x') }), ['falha-geojson']);
});

test('os dois falham: textos distintos', () => {
  const m = mensagensDeFalhas({ manifesto: new Error('a'), geojson: new Error('b') });
  assert.deepEqual(m.map((a) => a.id), ['falha-manifesto', 'datas-indisponiveis', 'falha-geojson']);
  assert.equal(new Set(m.map((a) => a.texto)).size, 3);
});

test('a causa técnica não vaza para o texto', () => {
  const m = mensagensDeFalhas({ manifesto: new Error('SEGREDO-TECNICO'), geojson: new Error('SEGREDO-TECNICO') });
  for (const a of m) assert.ok(!a.texto.includes('SEGREDO-TECNICO'));
});

test('falha de tiles cita a base', () => {
  for (const base of Object.values(BASES)) assert.ok(falhaTiles(base.nome).includes(`«${base.nome}»`));
});

test('baseDoErro: id da base ou null', () => {
  assert.equal(baseDoErro({ sourceId: 'base-osm' }, BASES), 'osm');
  assert.equal(baseDoErro({ sourceId: 'base-satelite' }, BASES), 'satelite');
  assert.equal(baseDoErro({ sourceId: 'base-inexistente' }, BASES), null);
  assert.equal(baseDoErro({ sourceId: 'itinerarios' }, BASES), null);
  assert.equal(baseDoErro({ error: new Error('x') }, BASES), null);
  assert.equal(baseDoErro(undefined, BASES), null);
});
