import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lerDataIso, formatarBrasilia, idadeRelativa, descreverData } from '../js/datas.js';

const br = (iso) => formatarBrasilia(new Date(iso));

test('T3: UTC para America/Sao_Paulo', () => {
  assert.equal(br('2026-11-04T17:55:32Z'), '04/11/2026 14:55:32');
  assert.equal(br('2026-11-05T10:59:17Z'), '05/11/2026 07:59:17');
});

test('virada de dia e de ano', () => {
  assert.equal(br('2026-01-01T02:00:00Z'), '31/12/2025 23:00:00');
  assert.equal(br('2026-11-05T03:00:00Z'), '05/11/2026 00:00:00');
});

const base = new Date('2026-11-05T12:00:00Z');
const idade = (msAtras) => idadeRelativa(new Date(base.getTime() - msAtras), base);
const MIN = 60000;
const H = 60 * MIN;

test('T4: faixas da idade relativa', () => {
  assert.equal(idade(30000), 'há menos de 1 min');
  assert.equal(idade(60000), 'há 1 min');
  assert.equal(idade(59 * MIN + 59000), 'há 59 min');
  assert.equal(idade(60 * MIN), 'há 1 h');
  assert.equal(idade(47 * H + 59 * MIN), 'há 47 h');
  assert.equal(idade(48 * H), 'há 2 dias');
  assert.equal(idade(5 * 24 * H), 'há 5 dias');
  assert.equal(idade(-5 * MIN), 'há menos de 1 min');
});

test('lerDataIso: só ISO UTC com Z; o resto é ilegível', () => {
  assert.ok(lerDataIso('2026-11-04T17:55:32Z'));
  for (const ruim of [null, undefined, '', 'ontem', '2026-11-04T17:55:32', '2026-13-45T99:00:00Z', 123]) {
    assert.equal(lerDataIso(ruim), null, String(ruim));
  }
});

test('descreverData: texto e idade; ilegível devolve null', () => {
  const d = descreverData('2026-11-04T17:55:32Z', new Date('2026-11-04T22:55:32Z'));
  assert.deepEqual(d, { absoluta: '04/11/2026 14:55:32', idade: 'há 5 h' });
  assert.equal(descreverData('lixo', base), null);
});
