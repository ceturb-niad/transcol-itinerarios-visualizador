// Busca por trecho do valor de `linha`, sem DOM (DEC-F06, DEC-F23).
// Ignora maiúsculas e acentos; não olha `nome` nem `codigo`.

export function normalizar(texto) {
  return texto.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

// Devolve um Set com os pares (as mesmas referências do modelo) cuja `linha` contém o trecho,
// ou null quando a consulta é vazia (sem filtro). A ordem de exibição é a da árvore.
export function buscarPares(modelo, consulta) {
  const trecho = normalizar(consulta.trim());
  if (trecho === '') return null;
  const achados = new Set();
  for (const grupo of modelo.grupos) {
    const pares = [...grupo.linhas, ...grupo.subgrupos.flatMap((s) => s.linhas)];
    for (const par of pares) {
      if (normalizar(par.linha).includes(trecho)) achados.add(par);
    }
  }
  return achados;
}
