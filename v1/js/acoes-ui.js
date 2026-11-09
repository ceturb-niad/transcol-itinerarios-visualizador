// Ações globais no topo da caixa lateral (DEC-F23): Ligar tudo e Limpar seleção.
// Independem da busca; Ligar tudo enquadra (via selecao.aoLigar) e Limpar não move o mapa.
import { TEXTOS } from './mensagens.js';

function botao(texto, aoClicar) {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = texto;
  b.addEventListener('click', aoClicar);
  return b;
}

// `campoBusca` passa a ficar no mesmo cabeçalho fixo, logo abaixo dos botões.
export function criarAcoes(contenedor, modelo, selecao, campoBusca) {
  const acoes = document.createElement('div');
  acoes.className = 'acoes';
  // Todas as features carregadas, inclusive as ocultas pelo filtro da busca.
  acoes.append(
    botao(TEXTOS.ligarTudo, () => selecao.ligarTudo(modelo.features.keys())),
    botao(TEXTOS.limparSelecao, () => selecao.limpar()),
  );
  const cabecalho = document.createElement('div');
  cabecalho.className = 'cabecalho';
  cabecalho.append(acoes, campoBusca);
  contenedor.prepend(cabecalho);
  return acoes;
}
