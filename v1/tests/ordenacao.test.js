import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compararLinhas, compararPontoDeCodigo, compararNomes } from '../js/ordenacao.js';

// Embaralhamento determinístico para não depender de sorte.
function embaralhar(lista) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = (i * 7 + 3) % (i + 1);
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

test('T2: linhas de Vitoria reproduzem a ordem esperada', () => {
  const esperado = ['010', '010A', '015', '022', '031', '031A', '044', '051', '052', '071', '072', '073N', '073S', '074'];
  assert.deepEqual(embaralhar(esperado).sort(compararLinhas), esperado);
  assert.deepEqual([...esperado].reverse().sort(compararLinhas), esperado);
});

test('T2: vetor sintético de misturas', () => {
  const entrada = ['1000', '200', '58', '158', '588_TCG>TIP', '58A', '058'];
  assert.deepEqual(
    [...entrada].sort(compararLinhas),
    ['58', '058', '58A', '158', '200', '588_TCG>TIP', '1000'],
  );
});

test('empate total mantém a ordem de entrada (sort estável)', () => {
  assert.equal(compararLinhas('58', '058'), 0);
  assert.deepEqual(['058', '58'].sort(compararLinhas), ['058', '58']);
});

test('linha sem dígito inicial vai ao fim, por ponto de código', () => {
  assert.deepEqual(
    ['B1', '20', 'A9', '3'].sort(compararLinhas),
    ['3', '20', 'A9', 'B1'],
  );
});

test('dígitos longos não perdem precisão', () => {
  assert.deepEqual(
    ['99999999999999999998', '99999999999999999997'].sort(compararLinhas),
    ['99999999999999999997', '99999999999999999998'],
  );
});

test('ponto de código difere da comparação nativa fora do plano básico', () => {
  const bmp = '～'; // U+FF5E
  const astral = '\u{1F600}'; // U+1F600, par substituto D83D DE00
  assert.ok(astral < bmp, 'pré-condição: UTF-16 põe o astral antes');
  assert.equal(compararPontoDeCodigo(astral, bmp), 1);
  assert.equal(compararPontoDeCodigo(bmp, astral), -1);
});

test('ponto de código: iguais, prefixo e ordem básica', () => {
  assert.equal(compararPontoDeCodigo('abc', 'abc'), 0);
  assert.equal(compararPontoDeCodigo('ab', 'abc'), -1);
  assert.equal(compararPontoDeCodigo('abc', 'ab'), 1);
  assert.equal(compararPontoDeCodigo('B', 'a'), -1); // maiúscula antes de minúscula
});

test('nomes de grupo em ordem alfabética pt-BR', () => {
  const grupos = ['Vitoria', 'Aquaviário', 'Viana', 'Cariacica', 'Bike GV', 'Fundao'];
  assert.deepEqual(
    [...grupos].sort(compararNomes),
    ['Aquaviário', 'Bike GV', 'Cariacica', 'Fundao', 'Viana', 'Vitoria'],
  );
});
