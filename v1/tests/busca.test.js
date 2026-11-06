import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buscarPares, normalizar } from '../js/busca.js';
import { construirModelo } from '../js/arvore.js';

const f = (grupo, subgrupo, linha, nome, extra = {}) => ({
  type: 'Feature',
  properties: { grupo, subgrupo, linha, nome, chave: `${grupo}/${linha}/${nome}`, ...extra },
  geometry: null,
});

const modelo = construirModelo({
  features: [
    f('Vitoria', null, '010', '010I'),
    f('Vitoria', null, '010A', '010AI'),
    f('Vitoria', null, '015', '015I'),
    f('Vitoria', null, '1000', '1000I'),
    f('Municipal de Vila Velha', null, '649', '649I'),
    f('Volta Direto', null, '649', '649I_B (Pleno Voo)'),
    f('Cariacica', null, '587_TCA', '587I'),
    f('Volta Direto', null, '587', '587I'),
    f('Praias', 'Cariacica', '513_TCG', '513I'),
    f('Aquaviário', null, 'Á1', 'x'),
    // `nome` e `codigo` contêm o trecho "777", `linha` não.
    f('Serra', null, '300', '777I', { codigo: '777' }),
  ],
});

const linhas = (set) => [...set].map((p) => `${p.grupo}/${p.linha}`);

test('"10" encontra 010, 010A e 1000', () => {
  assert.deepEqual(linhas(buscarPares(modelo, '10')).sort(), ['Vitoria/010', 'Vitoria/010A', 'Vitoria/1000']);
});

test('"649" encontra dois pares distintos', () => {
  assert.deepEqual(linhas(buscarPares(modelo, '649')).sort(), ['Municipal de Vila Velha/649', 'Volta Direto/649']);
});

test('"587" encontra 587_TCA e 587 de grupos diferentes', () => {
  assert.deepEqual(linhas(buscarPares(modelo, '587')).sort(), ['Cariacica/587_TCA', 'Volta Direto/587']);
});

test('trecho em qualquer posição, inclusive com sufixo', () => {
  assert.deepEqual(linhas(buscarPares(modelo, 'TCA')), ['Cariacica/587_TCA']);
  assert.deepEqual(linhas(buscarPares(modelo, '_tc')).sort(), ['Cariacica/587_TCA', 'Praias/513_TCG']);
});

test('ignora caixa e acento', () => {
  assert.deepEqual(linhas(buscarPares(modelo, 'a1')), ['Aquaviário/Á1']);
  assert.deepEqual(linhas(buscarPares(modelo, 'á1')), ['Aquaviário/Á1']);
  assert.equal(normalizar('Á1_TcA'), 'a1_tca');
});

test('não olha nome nem codigo', () => {
  assert.equal(buscarPares(modelo, '777').size, 0);
});

test('espaços nas pontas são ignorados; vazio devolve null', () => {
  assert.deepEqual(linhas(buscarPares(modelo, '  649 ')).sort(), ['Municipal de Vila Velha/649', 'Volta Direto/649']);
  assert.equal(buscarPares(modelo, ''), null);
  assert.equal(buscarPares(modelo, '   '), null);
});

test('sem resultado devolve Set vazio; pares são as referências do modelo', () => {
  assert.equal(buscarPares(modelo, 'zzz').size, 0);
  const par = modelo.par('Praias', '513_TCG');
  assert.ok(buscarPares(modelo, '513').has(par));
});
