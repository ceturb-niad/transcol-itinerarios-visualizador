import { test } from 'node:test';
import assert from 'node:assert/strict';
import { construirModelo } from '../js/arvore.js';

const f = (grupo, subgrupo, linha, nome, chave, extra = {}) => ({
  type: 'Feature',
  properties: { grupo, subgrupo, linha, nome, chave: chave ?? `${grupo}/${linha}/${nome}`, ...extra },
  geometry: { type: 'LineString', coordinates: [[0, 0], [1, 1]] },
});
const fc = (...features) => ({ type: 'FeatureCollection', features });

// Fixture com os casos de identidade da DEC-F04 / DEC-F22.
const fixture = () => fc(
  f('Eventos', null, '4216', '4216I'),
  f('Volta Direto', null, '4216', '4216I'),
  f('Municipal de Vila Velha', null, '649', '649I'),
  f('Volta Direto', null, '649', '649I_B (Pleno Voo)', 'Volta Direto/649I_B (Pleno Voo)'),
  f('Volta Direto', null, '649', '649V'),
  f('Municipal de Vila Velha', null, '675', '675I'),
  f('Volta Direto', null, '675', '675I'),
  f('Municipal de Vila Velha', null, '697', '697I'),
  f('Volta Direto', null, '697', '697I'),
  f('Troncais', null, '572_TLA>TST', '572I'),
  f('Noturno', 'Troncais', '801', '801I'),
  f('Noturno', 'Cariacica', '802', '802I'),
  f('Vitoria', null, '010A', '010AI'),
  f('Vitoria', null, '010', '010I'),
  f('Vitoria', null, '015', '015I'),
  f('Aquaviário', null, '1', '1I'),
);

test('4216, 649, 675 e 697 são pares distintos por grupo', () => {
  const m = construirModelo(fixture());
  for (const [linha, outroGrupo, nomesVD] of [
    ['4216', 'Eventos', ['4216I']],
    ['649', 'Municipal de Vila Velha', ['649I_B (Pleno Voo)', '649V']],
    ['675', 'Municipal de Vila Velha', ['675I']],
    ['697', 'Municipal de Vila Velha', ['697I']],
  ]) {
    const a = m.par(outroGrupo, linha);
    const b = m.par('Volta Direto', linha);
    assert.ok(a && b && a !== b, `${linha}: dois pares`);
    assert.equal(a.grupo, outroGrupo);
    assert.equal(b.grupo, 'Volta Direto');
    assert.deepEqual(b.features.map((x) => x.properties.nome), nomesVD);
    assert.ok(a.features.every((x) => x.properties.grupo === outroGrupo));
    assert.ok(b.features.every((x) => x.properties.grupo === 'Volta Direto'));
  }
});

test('Troncais é grupo e subgrupo de Noturno, em nós distintos', () => {
  const m = construirModelo(fixture());
  const grupoTroncais = m.grupos.find((g) => g.nome === 'Troncais');
  const noturno = m.grupos.find((g) => g.nome === 'Noturno');
  const subTroncais = noturno.subgrupos.find((s) => s.nome === 'Troncais');
  assert.ok(grupoTroncais && subTroncais);
  assert.notEqual(grupoTroncais, subTroncais);
  assert.deepEqual(grupoTroncais.caminho, ['Troncais']);
  assert.deepEqual(subTroncais.caminho, ['Noturno', 'Troncais']);
  assert.deepEqual(grupoTroncais.linhas.map((p) => p.linha), ['572_TLA>TST']);
  assert.deepEqual(subTroncais.linhas.map((p) => p.linha), ['801']);
  assert.deepEqual(noturno.linhas, []);
});

test('grupos e subgrupos em ordem alfabética pt-BR', () => {
  const m = construirModelo(fixture());
  assert.deepEqual(
    m.grupos.map((g) => g.nome),
    ['Aquaviário', 'Eventos', 'Municipal de Vila Velha', 'Noturno', 'Troncais', 'Vitoria', 'Volta Direto'],
  );
  const noturno = m.grupos.find((g) => g.nome === 'Noturno');
  assert.deepEqual(noturno.subgrupos.map((s) => s.nome), ['Cariacica', 'Troncais']);
});

test('linhas do grupo em ordem numérica e features do par por ponto de código', () => {
  const m = construirModelo(fixture());
  const vitoria = m.grupos.find((g) => g.nome === 'Vitoria');
  assert.deepEqual(vitoria.linhas.map((p) => p.linha), ['010', '010A', '015']);

  const par = m.par('Volta Direto', '649');
  assert.deepEqual(par.features.map((x) => x.properties.nome), ['649I_B (Pleno Voo)', '649V']);
  assert.deepEqual(par.caminho, ['Volta Direto', null, '649']);
  assert.deepEqual(m.par('Noturno', '801').caminho, ['Noturno', 'Troncais', '801']);
});

test('features indexadas por chave em Map, inclusive com espaço e parênteses', () => {
  const entrada = fixture();
  const m = construirModelo(entrada);
  assert.equal(m.features.size, entrada.features.length);
  const chave = 'Volta Direto/649I_B (Pleno Voo)';
  assert.equal(m.features.get(chave).properties.nome, '649I_B (Pleno Voo)');
});

test('mantém as referências da entrada, sem alterá-la, e ignora propriedades desconhecidas', () => {
  const entrada = fc(
    f('Vitoria', null, '010', '010I', undefined, { campo_futuro: 'x', outro: 1 }),
  );
  const copia = structuredClone(entrada);
  const m = construirModelo(entrada);
  assert.deepEqual(entrada, copia);
  assert.equal(m.features.get('Vitoria/010/010I'), entrada.features[0]);
  assert.equal(m.par('Vitoria', '010').features[0], entrada.features[0]);
});

test('par inexistente devolve undefined', () => {
  const m = construirModelo(fixture());
  assert.equal(m.par('Serra', '1'), undefined);
  assert.equal(m.par('Vitoria', '999'), undefined);
});
