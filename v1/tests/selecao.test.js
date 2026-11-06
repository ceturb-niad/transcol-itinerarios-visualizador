import { test } from 'node:test';
import assert from 'node:assert/strict';
import { construirModelo } from '../js/arvore.js';
import { criarSelecao } from '../js/selecao.js';
import { filtroPorChaves } from '../js/mapa-itinerarios.js';

const f = (grupo, linha, nome, chave) => ({
  type: 'Feature',
  properties: { grupo, subgrupo: null, linha, nome, chave: chave ?? `${grupo}/${linha}/${nome}` },
  geometry: { type: 'LineString', coordinates: [[0, 0], [1, 1]] },
});

const modelo = construirModelo({
  type: 'FeatureCollection',
  features: [
    f('Municipal de Vila Velha', '649', '649I'),
    f('Municipal de Vila Velha', '649', '649V'),
    f('Volta Direto', '649', '649I_B (Pleno Voo)', 'Volta Direto/649I_B (Pleno Voo)'),
    f('Volta Direto', '649', '649V'),
    f('Volta Direto', '649', '649I'),
  ],
});
const vv = modelo.par('Municipal de Vila Velha', '649');
const vd = modelo.par('Volta Direto', '649');

test('três estados da linha e transições (C6)', () => {
  const s = criarSelecao();
  assert.equal(s.estadoLinha(vv), 'nenhuma');
  assert.equal(s.alternarLinha(vv), true);
  assert.equal(s.estadoLinha(vv), 'todas');
  s.alternarFeature(vv.features[0].properties.chave);
  assert.equal(s.estadoLinha(vv), 'algumas');
  assert.equal(s.alternarLinha(vv), true, 'intermediária liga todas');
  assert.equal(s.estadoLinha(vv), 'todas');
  assert.equal(s.alternarLinha(vv), false, 'toda ligada desliga todas');
  assert.equal(s.estadoLinha(vv), 'nenhuma');
});

test('mesmo número em grupos distintos é independente (C5)', () => {
  const s = criarSelecao();
  s.alternarLinha(vv);
  assert.equal(s.estadoLinha(vd), 'nenhuma');
  assert.equal(s.ligadas.size, 2);
});

test('chave com espaço e parênteses liga e desliga (C16)', () => {
  const s = criarSelecao();
  const chave = 'Volta Direto/649I_B (Pleno Voo)';
  s.alternarFeature(chave);
  assert.ok(s.estaLigada(chave));
  assert.equal(s.estadoLinha(vd), 'algumas');
  s.alternarFeature(chave);
  assert.ok(!s.estaLigada(chave));
});

test('limpar e notificações', () => {
  const s = criarSelecao();
  let chamadas = 0;
  s.aoMudar(() => { chamadas += 1; });
  s.limpar();
  assert.equal(chamadas, 0, 'limpar vazio não notifica');
  s.alternarLinha(vd);
  assert.equal(chamadas, 1);
  s.limpar();
  assert.equal(chamadas, 2);
  assert.equal(s.ligadas.size, 0);
});

test('filtro do mapa: vazio não casa nada; com chaves usa literal', () => {
  assert.deepEqual(filtroPorChaves([]), ['==', ['get', 'chave'], '']);
  assert.deepEqual(filtroPorChaves(new Set(['a b (c)'])), ['in', ['get', 'chave'], ['literal', ['a b (c)']]]);
});
