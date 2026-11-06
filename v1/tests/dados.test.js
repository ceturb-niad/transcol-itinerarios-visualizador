import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { carregarItinerarios, validarManifesto, validarFeatureCollection } from '../js/dados.js';

const dados = { urlBase: 'https://exemplo.test/d/', manifesto: 'manifest.json', geojson: 'itinerarios.geojson' };
const URL_MANIFESTO = 'https://exemplo.test/d/manifest.json';
const URL_GEOJSON = 'https://exemplo.test/d/itinerarios.geojson';

const feature = (chave, extra = {}) => ({
  type: 'Feature',
  properties: { chave, nome: 'x', linha: '1', grupo: 'G', ...extra },
  geometry: { type: 'LineString', coordinates: [[0, 0], [1, 1]] },
});
const fc = (...features) => ({ type: 'FeatureCollection', features });
const MANIFESTO = { hash_origem: 'abc123', dados_atualizados_em: '2026-11-04T17:55:32Z' };

const json = (corpo, status = 200) => ({ ok: status < 400, status, json: async () => corpo });
const html = (status = 200) => ({
  ok: status < 400,
  status,
  json: async () => { throw new SyntaxError('Unexpected token <'); },
});

// Simula fetch por URL base (sem query); registra chamadas.
function simular(rotas) {
  const chamadas = [];
  const fetchFn = async (url, opcoes) => {
    chamadas.push({ url, opcoes });
    const r = rotas[url.split('?')[0]];
    if (r instanceof Error) throw r;
    return r;
  };
  return { fetchFn, chamadas };
}

let avisos;
const warnOriginal = console.warn;
beforeEach(() => { avisos = []; console.warn = (...a) => avisos.push(a); });
afterEach(() => { console.warn = warnOriginal; });

test('sucesso: manifesto no-store, GeoJSON com ?v=hash, sem falhas', async () => {
  const { fetchFn, chamadas } = simular({ [URL_MANIFESTO]: json(MANIFESTO), [URL_GEOJSON]: json(fc(feature('a'))) });
  const r = await carregarItinerarios({ fetchFn, dados });
  assert.deepEqual(r.falhas, { manifesto: null, geojson: null });
  assert.equal(r.manifesto.hash_origem, 'abc123');
  assert.equal(r.geojson.features.length, 1);
  assert.equal(chamadas[0].url, URL_MANIFESTO);
  assert.deepEqual(chamadas[0].opcoes, { cache: 'no-store' });
  assert.equal(chamadas[1].url, `${URL_GEOJSON}?v=abc123`);
  assert.equal(chamadas[1].opcoes, undefined);
});

for (const [nome, resp] of [
  ['rede', new TypeError('Failed to fetch')],
  ['HTTP 500', json({}, 500)],
  ['não é JSON', html()],
  ['sem hash_origem', json({ dados_atualizados_em: 'x' })],
  ['hash_origem vazio', json({ hash_origem: '  ' })],
  ['hash_origem não é texto', json({ hash_origem: 7 })],
  ['não é objeto', json([1])],
]) {
  test(`manifesto falho (${nome}): GeoJSON sem ?v=, manifesto null`, async () => {
    const { fetchFn, chamadas } = simular({ [URL_MANIFESTO]: resp, [URL_GEOJSON]: json(fc(feature('a'))) });
    const r = await carregarItinerarios({ fetchFn, dados });
    assert.ok(r.falhas.manifesto instanceof Error);
    assert.equal(r.manifesto, null);
    assert.equal(r.falhas.geojson, null);
    assert.equal(r.geojson.features.length, 1);
    assert.equal(chamadas[1].url, URL_GEOJSON);
    assert.ok(avisos.length >= 1);
  });
}

for (const [nome, resp] of [
  ['rede', new TypeError('Failed to fetch')],
  ['HTTP 404', json({}, 404)],
  ['não é JSON', html()],
]) {
  test(`GeoJSON falho (${nome}): manifesto íntegro permanece`, async () => {
    const { fetchFn } = simular({ [URL_MANIFESTO]: json(MANIFESTO), [URL_GEOJSON]: resp });
    const r = await carregarItinerarios({ fetchFn, dados });
    assert.ok(r.falhas.geojson instanceof Error);
    assert.equal(r.geojson, null);
    assert.equal(r.falhas.manifesto, null);
    assert.equal(r.manifesto.hash_origem, 'abc123');
  });
}

for (const [nome, corpo] of [
  ['objeto sem features', { type: 'FeatureCollection' }],
  ['features vazio', fc()],
  ['outro type', { type: 'Feature', features: [feature('a')] }],
  ['JSON nulo', null],
  ['lista', [feature('a')]],
]) {
  test(`resposta que não é FeatureCollection com features (${nome}) conta como falha`, async () => {
    const { fetchFn } = simular({ [URL_MANIFESTO]: json(MANIFESTO), [URL_GEOJSON]: json(corpo) });
    const r = await carregarItinerarios({ fetchFn, dados });
    assert.ok(r.falhas.geojson instanceof Error);
    assert.equal(r.geojson, null);
  });
}

test('os dois falham: ambas as falhas, nada lança', async () => {
  const rede = new TypeError('Failed to fetch');
  const { fetchFn } = simular({ [URL_MANIFESTO]: rede, [URL_GEOJSON]: rede });
  const r = await carregarItinerarios({ fetchFn, dados });
  assert.ok(r.falhas.manifesto instanceof Error);
  assert.ok(r.falhas.geojson instanceof Error);
  assert.equal(r.manifesto, null);
  assert.equal(r.geojson, null);
});

test('propriedades desconhecidas são ignoradas e chave com espaço/parênteses é preservada', async () => {
  const chave = 'Volta Direto/649I_B (Pleno Voo)';
  const { fetchFn } = simular({
    [URL_MANIFESTO]: json({ ...MANIFESTO, campo_novo: { a: 1 } }),
    [URL_GEOJSON]: json({ ...fc(feature(chave, { campo_futuro: 'z' })), extra: true }),
  });
  const r = await carregarItinerarios({ fetchFn, dados });
  assert.deepEqual(r.falhas, { manifesto: null, geojson: null });
  assert.equal(r.geojson.features[0].properties.chave, chave);
  assert.equal(r.geojson.features[0].properties.campo_futuro, 'z');
});

test('hash é codificado na query', async () => {
  const { fetchFn, chamadas } = simular({
    [URL_MANIFESTO]: json({ hash_origem: 'a b&c' }),
    [URL_GEOJSON]: json(fc(feature('a'))),
  });
  await carregarItinerarios({ fetchFn, dados });
  assert.equal(chamadas[1].url, `${URL_GEOJSON}?v=a%20b%26c`);
});

test('validadores', () => {
  assert.equal(validarManifesto({ hash_origem: ' h ' }), 'h');
  assert.throws(() => validarManifesto(null));
  assert.throws(() => validarFeatureCollection({ type: 'FeatureCollection', features: 'x' }));
});
