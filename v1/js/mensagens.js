// Todos os textos de interface das falhas (DEC-F15, DEC-F25). Sem DOM.
// [Proposta] Textos pendentes de revisão do responsável. A causa técnica vai ao console, nunca aqui.

export const TEXTOS = {
  falhaManifesto:
    'Não foi possível obter as datas de atualização dos dados. Os itinerários foram carregados, mas não é possível confirmar quão recentes são.',
  semResultadoBusca: 'Nenhuma linha encontrada',
  datasIndisponiveis: 'Datas de atualização indisponíveis',
  falhaGeojson:
    'Não foi possível carregar os itinerários. Verifique a conexão e recarregue a página; a rede também pode estar bloqueando o acesso aos dados. Se o problema persistir, avise o administrador do visualizador.',
};

export function falhaTiles(nomeBase) {
  return `Não foi possível carregar o mapa de fundo «${nomeBase}». Os itinerários continuam disponíveis; tente a outra base ou recarregue a página.`;
}

// Converte `falhas` de carregarItinerarios() em avisos, na ordem manifesto, GeoJSON.
// `persistente` marca o aviso que ocupa o lugar das datas e não pode ser dispensado.
export function mensagensDeFalhas(falhas) {
  const avisos = [];
  if (falhas?.manifesto) {
    avisos.push({ id: 'falha-manifesto', texto: TEXTOS.falhaManifesto, persistente: false });
    avisos.push({ id: 'datas-indisponiveis', texto: TEXTOS.datasIndisponiveis, persistente: true });
  }
  if (falhas?.geojson) {
    avisos.push({ id: 'falha-geojson', texto: TEXTOS.falhaGeojson, persistente: false });
  }
  return avisos;
}
