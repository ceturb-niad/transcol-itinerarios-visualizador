import { test } from 'node:test';
import assert from 'node:assert/strict';
import { indicePorChave, itensDoPopup } from '../js/popup.js';

const f = (chave, nome, linha, grupo, extra = {}) => ({ properties: { chave, nome, linha, grupo, ...extra } });
const geojson = {
  features: [
    f('Volta Direto/649I_B (Pleno Voo)', '649I_B (Pleno Voo)', '649', 'Volta Direto', { novo: 1 }),
    f('MVV/649I', '649I', '649', 'Municipal de Vila Velha'),
    f('Eventos/4216A', '4216A', '4216', 'Eventos'),
    f('Volta Direto/4216A', '4216A', '4216', 'Volta Direto'),
  ],
};
const indice = indicePorChave(geojson);

test('chave com espaço e parênteses resolve nome, linha e grupo; extras são ignoradas', () => {
  const [item] = itensDoPopup(['Volta Direto/649I_B (Pleno Voo)'], indice);
  assert.equal(item.nome, '649I_B (Pleno Voo)');
  assert.equal(item.linha, '649');
  assert.equal(item.grupo, 'Volta Direto');
});

test('remove duplicatas e ordena por nome em ponto de código', () => {
  const itens = itensDoPopup(['MVV/649I', 'Eventos/4216A', 'MVV/649I', 'Eventos/4216A'], indice);
  assert.deepEqual(itens.map((i) => i.chave), ['Eventos/4216A', 'MVV/649I']);
});

test('linha repetida entre grupos mantém o grupo de cada chave', () => {
  const itens = itensDoPopup(['Volta Direto/4216A', 'Eventos/4216A'], indice);
  assert.deepEqual(itens.map((i) => i.grupo).sort(), ['Eventos', 'Volta Direto']);
});

test('chave desconhecida é ignorada; lista vazia devolve vazio', () => {
  assert.deepEqual(itensDoPopup(['nao-existe'], indice), []);
  assert.deepEqual(itensDoPopup([], indice), []);
});
