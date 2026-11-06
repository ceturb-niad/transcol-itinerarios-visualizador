// Comparadores puros, sem DOM (DEC-F20, DEC-F21, DEC-F22).

// Ponto de código (não unidades UTF-16 nem localeCompare): a ordem define a cor
// das features e não pode variar com o locale (DEC-F21).
export function compararPontoDeCodigo(a, b) {
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    const ca = a.codePointAt(i);
    const cb = b.codePointAt(j);
    if (ca !== cb) return ca < cb ? -1 : 1;
    i += ca > 0xffff ? 2 : 1;
    j += cb > 0xffff ? 2 : 1;
  }
  // Prefixo: o mais curto vem antes.
  const restoA = a.length - i;
  const restoB = b.length - j;
  return restoA === restoB ? 0 : restoA < restoB ? -1 : 1;
}

// Divide `linha` em dígitos iniciais (sem zeros à esquerda) e o texto restante.
function partesDaLinha(linha) {
  const m = /^\d+/.exec(linha);
  if (!m) return { digitos: null, resto: linha };
  return { digitos: m[0].replace(/^0+/, ''), resto: linha.slice(m[0].length) };
}

// Ordem das linhas (DEC-F22): valor numérico dos dígitos iniciais, ignorando zeros à
// esquerda; empate pelo texto restante por ponto de código; sem dígito inicial vai ao fim.
// Empate total devolve 0 (Array.prototype.sort é estável: vale a ordem de entrada).
export function compararLinhas(a, b) {
  const pa = partesDaLinha(a);
  const pb = partesDaLinha(b);
  if (pa.digitos === null || pb.digitos === null) {
    if (pa.digitos === pb.digitos) return compararPontoDeCodigo(a, b);
    return pa.digitos === null ? 1 : -1;
  }
  // Sem zeros à esquerda, mais dígitos = maior; mesmo tamanho: comparação lexicográfica
  // (evita perda de precisão de Number em sequências longas).
  if (pa.digitos.length !== pb.digitos.length) {
    return pa.digitos.length < pb.digitos.length ? -1 : 1;
  }
  if (pa.digitos !== pb.digitos) return pa.digitos < pb.digitos ? -1 : 1;
  return compararPontoDeCodigo(pa.resto, pb.resto);
}

// Grupos e subgrupos: ordem alfabética pt-BR, na exibição (DEC-F20).
const colador = new Intl.Collator('pt-BR');
export function compararNomes(a, b) {
  return colador.compare(a, b);
}
