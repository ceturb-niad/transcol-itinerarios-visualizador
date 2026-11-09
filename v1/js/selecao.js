// Estado da seleção, sem DOM (DEC-F07, DEC-F23). Conjunto de `chave` ligadas; a linha é o par
// (grupo, linha) do modelo, nunca `linha` sozinha. Não persiste: recarregar a página perde tudo.

export const ESTADOS = Object.freeze({ nenhuma: 'nenhuma', algumas: 'algumas', todas: 'todas' });

export function criarSelecao() {
  const ligadas = new Set();
  const ouvintes = [];
  const ouvintesLigar = [];
  // Pedido de ligar (para enquadrar, 5.2): leva as chaves pedidas, inclusive as já ligadas.
  const avisarLigar = (chaves) => ouvintesLigar.forEach((fn) => fn(chaves));
  const avisar = () => ouvintes.forEach((fn) => fn(ligadas));
  const chavesDe = (par) => par.features.map((f) => f.properties.chave);

  function estadoLinha(par) {
    const total = par.features.length;
    let n = 0;
    for (const chave of chavesDe(par)) if (ligadas.has(chave)) n += 1;
    if (n === 0) return ESTADOS.nenhuma;
    return n === total ? ESTADOS.todas : ESTADOS.algumas;
  }

  // Liga o que ainda não está ligado; devolve as chaves realmente ligadas agora.
  function ligar(chaves) {
    const novas = [];
    for (const chave of chaves) {
      if (!ligadas.has(chave)) {
        ligadas.add(chave);
        novas.push(chave);
      }
    }
    if (novas.length) avisar();
    return novas;
  }

  function desligar(chaves) {
    let mudou = false;
    for (const chave of chaves) mudou = ligadas.delete(chave) || mudou;
    if (mudou) avisar();
  }

  return {
    ligadas,
    estaLigada: (chave) => ligadas.has(chave),
    estadoLinha,
    ligar,
    desligar,
    alternarFeature(chave) {
      if (ligadas.has(chave)) {
        desligar([chave]);
        return;
      }
      ligar([chave]);
      avisarLigar([chave]);
    },
    // Desligada ou intermediária liga todas; toda ligada desliga todas (C6).
    // Devolve true se ligou (quem enquadra, na 5.2, só reage a ligar).
    alternarLinha(par) {
      if (estadoLinha(par) === ESTADOS.todas) {
        desligar(chavesDe(par));
        return false;
      }
      const chaves = chavesDe(par);
      ligar(chaves);
      avisarLigar(chaves);
      return true;
    },
    // Ligar tudo: liga e pede enquadramento de todas, mesmo se já estavam ligadas.
    ligarTudo(chaves) {
      const lista = [...chaves];
      ligar(lista);
      avisarLigar(lista);
    },
    limpar() {
      if (!ligadas.size) return;
      ligadas.clear();
      avisar();
    },
    aoMudar(fn) {
      ouvintes.push(fn);
    },
    aoLigar(fn) {
      ouvintesLigar.push(fn);
    },
  };
}
