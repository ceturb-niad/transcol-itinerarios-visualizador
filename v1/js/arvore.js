// Modelo de dados da árvore, sem DOM (DEC-F04, DEC-F20, DEC-F22).
// Nó identificado pelo caminho estruturado (grupo, subgrupo, linha), nunca por texto
// concatenado; a linha é o par (grupo, linha). Features indexadas por `chave` em Map.
import { compararLinhas, compararNomes, compararPontoDeCodigo } from './ordenacao.js';

const SEM_SUBGRUPO = Symbol('sem-subgrupo');

function obter(mapa, chave, criar) {
  let valor = mapa.get(chave);
  if (valor === undefined) {
    valor = criar();
    mapa.set(chave, valor);
  }
  return valor;
}

// Devolve { grupos, features, par(grupo, linha) }. As features são as mesmas referências
// da entrada (nada é copiado nem alterado), para o módulo de cores anexar `_cor`.
export function construirModelo(geojson) {
  const features = new Map();
  // grupo -> subgrupo (ou SEM_SUBGRUPO) -> linha -> par
  const porGrupo = new Map();

  for (const feature of geojson.features) {
    const p = feature.properties;
    features.set(p.chave, feature);
    const subgrupos = obter(porGrupo, p.grupo, () => new Map());
    const chaveSub = p.subgrupo ?? SEM_SUBGRUPO;
    const linhas = obter(subgrupos, chaveSub, () => new Map());
    const par = obter(linhas, p.linha, () => ({
      grupo: p.grupo,
      subgrupo: p.subgrupo ?? null,
      linha: p.linha,
      caminho: [p.grupo, p.subgrupo ?? null, p.linha],
      features: [],
    }));
    par.features.push(feature);
  }

  const ordenarPares = (mapaLinhas) => {
    const pares = [...mapaLinhas.values()];
    for (const par of pares) {
      par.features.sort((a, b) => compararPontoDeCodigo(a.properties.nome, b.properties.nome));
    }
    return pares.sort((a, b) => compararLinhas(a.linha, b.linha));
  };

  const grupos = [...porGrupo.entries()]
    .map(([nome, subgrupos]) => {
      const semSub = subgrupos.get(SEM_SUBGRUPO);
      const comSub = [...subgrupos.entries()]
        .filter(([chave]) => chave !== SEM_SUBGRUPO)
        .map(([subNome, linhas]) => ({
          nome: subNome,
          caminho: [nome, subNome],
          linhas: ordenarPares(linhas),
        }))
        .sort((a, b) => compararNomes(a.nome, b.nome));
      return {
        nome,
        caminho: [nome],
        linhas: semSub ? ordenarPares(semSub) : [],
        subgrupos: comSub,
      };
    })
    .sort((a, b) => compararNomes(a.nome, b.nome));

  // Busca por par sem concatenar texto: percorre os Maps aninhados.
  const par = (grupo, linha) => {
    const subgrupos = porGrupo.get(grupo);
    if (!subgrupos) return undefined;
    for (const linhas of subgrupos.values()) {
      const achado = linhas.get(linha);
      if (achado) return achado;
    }
    return undefined;
  };

  return { grupos, features, par };
}
