// Enquadramento ao ligar, sem DOM (DEC-F09, DEC-F24).

// Retângulo [[oeste, sul], [leste, norte]] que contém as features (LineString 2D), ou null se
// não houver coordenada alguma.
export function limitesDe(features) {
  let oeste = Infinity;
  let sul = Infinity;
  let leste = -Infinity;
  let norte = -Infinity;
  for (const f of features) {
    for (const [lng, lat] of f?.geometry?.coordinates ?? []) {
      if (lng < oeste) oeste = lng;
      if (lng > leste) leste = lng;
      if (lat < sul) sul = lat;
      if (lat > norte) norte = lat;
    }
  }
  return oeste === Infinity ? null : [[oeste, sul], [leste, norte]];
}

// Padding do `fitBounds`. À esquerda: folga da borda + largura medida da caixa lateral + folga.
// Se isso deixar menos que `larguraMinima` de mapa útil, reduz a esquerda para preservá-la.
export function paddingDe(larguraCaixa, larguraJanela, { folga, larguraMinima }, folgaCaixa) {
  let esquerda = folgaCaixa + larguraCaixa + folga.esquerda;
  const maximo = Math.max(0, larguraJanela - folga.direita - larguraMinima);
  if (esquerda > maximo) esquerda = maximo;
  return { top: folga.topo, right: folga.direita, bottom: folga.baixo, left: esquerda };
}
