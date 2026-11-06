import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fnv1a32, corDaPosicao, anexarCores } from '../js/cores.js';
import { construirModelo } from '../js/arvore.js';
import { CORES } from '../js/config.js';

test('FNV-1a: vetores publicados e dos pares reais (T1)', () => {
  const vetores = [
    ['', 0x811c9dc5, 1],
    ['a', 0xe40c292c, 0],
    ['foobar', 0xbf9cf968, 0],
    ['Troncais|572_TLA>TST', 0x80688631, 5],
    ['Volta Direto|649', 0xfd7855c9, 9],
    ['Municipal de Vila Velha|649', 0x903d1e05, 5],
    ['Eventos|4216', 0xb95da96a, 8],
    ['Volta Direto|4216', 0xeebaa23d, 7],
    ['Aquaviário|1', 0x54d250a5, 9],
  ];
  for (const [entrada, hash, mod] of vetores) {
    assert.equal(fnv1a32(entrada), hash, entrada);
    assert.equal(hash % 10, mod, entrada);
  }
});

test('Troncais/572_TLA>TST: posição 0 usa o índice 5 e as posições seguem em rotação', () => {
  assert.equal(corDaPosicao('Troncais', '572_TLA>TST', 0), '#00C8D7');
  assert.equal(corDaPosicao('Troncais', '572_TLA>TST', 1), CORES.paleta[6]);
  assert.equal(corDaPosicao('Troncais', '572_TLA>TST', 5), CORES.paleta[0]);
});

const par = (n) => Array.from({ length: n }, (_, i) => ({
  type: 'Feature',
  properties: { grupo: 'G', subgrupo: null, linha: 'L', nome: `L${String(i).padStart(3, '0')}`, chave: `G/L/${i}` },
  geometry: null,
}));

test('par de 10 features: 10 cores distintas', () => {
  const m = anexarCores(construirModelo({ features: par(10) }));
  const cores = m.grupos[0].linhas[0].features.map((f) => f.properties._cor);
  assert.equal(new Set(cores).size, 10);
});

test('par sintético acima de 10: sem repetição, inclusive contra a paleta', () => {
  const m = anexarCores(construirModelo({ features: par(40) }));
  const cores = m.grupos[0].linhas[0].features.map((f) => f.properties._cor);
  assert.equal(new Set(cores).size, 40);
  assert.ok(cores.slice(10).every((c) => c.startsWith('hsl(')));
});

test('determinismo e propriedades originais intactas', () => {
  const a = anexarCores(construirModelo({ features: par(3) }));
  const b = anexarCores(construirModelo({ features: par(3) }));
  const cor = (m) => m.grupos[0].linhas[0].features.map((f) => f.properties._cor);
  assert.deepEqual(cor(a), cor(b));
  const f = a.grupos[0].linhas[0].features[0].properties;
  assert.equal(f.chave, 'G/L/0');
  assert.equal(f.nome, 'L000');
});
