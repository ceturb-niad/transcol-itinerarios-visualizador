// Cores determinísticas por feature, sem DOM (DEC-F08, DEC-F18, DEC-F21).
import { CORES } from './config.js';

// FNV-1a de 32 bits, sem sinal, sobre os bytes UTF-8.
export function fnv1a32(texto) {
  let h = 0x811c9dc5;
  for (const byte of new TextEncoder().encode(texto)) {
    h ^= byte;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

// Cor da feature na posição `p` (0, 1, ...) da ordem do par. Dentro da paleta, rotação a
// partir do hash; acima dela, ângulo áureo em HSL (sem repetição no par).
export function corDaPosicao(grupo, linha, p, cores = CORES) {
  const n = cores.paleta.length;
  if (p < n) return cores.paleta[(fnv1a32(`${grupo}|${linha}`) + p) % n];
  const { saturacao, luminosidade } = cores.hslExcedente;
  const matiz = ((p - n + 1) * cores.anguloAureo) % 360;
  return `hsl(${matiz.toFixed(1)} ${saturacao}% ${luminosidade}%)`;
}

// Anexa `_cor` (só em memória, com prefixo) às features do modelo da árvore.
export function anexarCores(modelo, cores = CORES) {
  for (const g of modelo.grupos) {
    const pares = [...g.linhas, ...g.subgrupos.flatMap((s) => s.linhas)];
    for (const par of pares) {
      par.features.forEach((feature, p) => {
        feature.properties._cor = corDaPosicao(par.grupo, par.linha, p, cores);
      });
    }
  }
  return modelo;
}
