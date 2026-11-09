import { test } from 'node:test';
import assert from 'node:assert/strict';
import { limitesDe, paddingDe } from '../js/enquadramento.js';
import { ENQUADRAMENTO, CAIXA_LATERAL } from '../js/config.js';

const linha = (...coords) => ({ geometry: { type: 'LineString', coordinates: coords } });

test('limitesDe: uma feature', () => {
  assert.deepEqual(limitesDe([linha([-40.3, -20.2], [-40.1, -20.4])]), [[-40.3, -20.4], [-40.1, -20.2]]);
});

test('limitesDe: várias features somam os limites', () => {
  const l = limitesDe([linha([-40.3, -20.2], [-40.2, -20.3]), linha([-40.0, -20.5], [-40.1, -20.1])]);
  assert.deepEqual(l, [[-40.3, -20.5], [-40.0, -20.1]]);
});

test('limitesDe: um ponto só dá retângulo degenerado; vazio ou sem coordenadas dá null', () => {
  assert.deepEqual(limitesDe([linha([-40.3, -20.2])]), [[-40.3, -20.2], [-40.3, -20.2]]);
  assert.equal(limitesDe([]), null);
  assert.equal(limitesDe([undefined, linha()]), null);
});

test('paddingDe: esquerda = folga da borda + caixa medida + folga', () => {
  const p = paddingDe(320, 1300, ENQUADRAMENTO, CAIXA_LATERAL.folga);
  assert.equal(p.left, CAIXA_LATERAL.folga + 320 + ENQUADRAMENTO.folga.esquerda);
  assert.equal(p.top, ENQUADRAMENTO.folga.topo);
  assert.equal(p.right, ENQUADRAMENTO.folga.direita);
  assert.equal(p.bottom, ENQUADRAMENTO.folga.baixo);
});

test('paddingDe: janela estreita preserva a largura mínima útil', () => {
  const p = paddingDe(320, 500, ENQUADRAMENTO, CAIXA_LATERAL.folga);
  assert.equal(500 - p.left - p.right, ENQUADRAMENTO.larguraMinima);
  assert.equal(paddingDe(320, 100, ENQUADRAMENTO, CAIXA_LATERAL.folga).left, 0);
});
