// Campo de busca no topo da caixa lateral (DEC-F06, DEC-F23). Liga buscarPares à árvore.
import { buscarPares } from './busca.js';
import { TEXTOS } from './mensagens.js';

export function criarBusca(contenedor, modelo, arvore) {
  const campo = document.createElement('input');
  campo.type = 'search';
  campo.className = 'busca-campo';
  campo.placeholder = 'Buscar linha';
  campo.autocomplete = 'off';
  campo.setAttribute('aria-label', 'Buscar linha');

  const vazio = document.createElement('p');
  vazio.className = 'busca-vazio';
  vazio.setAttribute('role', 'status');
  vazio.textContent = TEXTOS.semResultadoBusca;
  vazio.hidden = true;

  campo.addEventListener('input', () => {
    const visiveis = arvore.aplicarFiltro(buscarPares(modelo, campo.value));
    vazio.hidden = visiveis !== 0;
  });

  contenedor.prepend(campo, vazio);
  return campo;
}
