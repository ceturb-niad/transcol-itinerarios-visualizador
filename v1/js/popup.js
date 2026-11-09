// Itens do popup de clique, sem DOM (DEC-F09, DEC-F28).
import { compararPontoDeCodigo } from './ordenacao.js';

// Map chave -> { nome, linha, grupo }. `chave` só é usada como chave de Map, nunca em id/seletor.
export function indicePorChave(geojson) {
  const indice = new Map();
  for (const f of geojson?.features ?? []) {
    const { chave, nome, linha, grupo } = f.properties;
    indice.set(chave, { nome, linha, grupo });
  }
  return indice;
}

// Chaves sob o clique (possivelmente repetidas, pois a feature aparece nas duas camadas e
// em vários tiles) -> itens únicos, ordenados por `nome` em ponto de código. Chave desconhecida é ignorada.
export function itensDoPopup(chaves, porChave) {
  const vistas = new Set();
  const itens = [];
  for (const chave of chaves) {
    if (vistas.has(chave)) continue;
    vistas.add(chave);
    const item = porChave.get(chave);
    if (item) itens.push({ chave, ...item });
  }
  return itens.sort((a, b) => compararPontoDeCodigo(a.nome, b.nome));
}
