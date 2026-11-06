// Seletor de base do mapa, sobreposto ao mapa em #controles (DEC-F10, DEC-F11).
import { BASES, BASE_INICIAL } from './config.js';
import { alternarBase } from './mapa.js';

export function criarControleBase(contenedor, mapa) {
  const grupo = document.createElement('div');
  grupo.className = 'controle-base';
  grupo.setAttribute('role', 'group');
  grupo.setAttribute('aria-label', 'Mapa de base');

  const botoes = new Map();
  for (const [id, base] of Object.entries(BASES)) {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.textContent = base.nome;
    botao.dataset.base = id;
    botao.setAttribute('aria-pressed', String(id === BASE_INICIAL));
    botao.addEventListener('click', () => {
      alternarBase(mapa, BASES, id);
      for (const [outro, b] of botoes) b.setAttribute('aria-pressed', String(outro === id));
    });
    botoes.set(id, botao);
    grupo.append(botao);
  }
  contenedor.append(grupo);
  return grupo;
}
