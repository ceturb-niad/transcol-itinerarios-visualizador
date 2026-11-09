// Datas de atualização na tela (DEC-F14, DEC-F26). Só a idade é recalculada a cada 60 s.
import { DATAS } from './config.js';
import { TEXTOS } from './mensagens.js';
import { lerDataIso, formatarBrasilia, idadeRelativa } from './datas.js';
import { mostrarAviso } from './avisos.js';

const CAMPOS = [
  ['dados_atualizados_em', TEXTOS.rotuloAtualizados],
  ['verificado_em', TEXTOS.rotuloVerificado],
];

// `agora`: função que devolve a hora atual (injetável).
export function criarDatas(elemento, manifesto, { agora = () => new Date() } = {}) {
  const linhas = [];
  for (const [campo, rotulo] of CAMPOS) {
    const data = lerDataIso(manifesto?.[campo]);
    if (!data) {
      console.warn(`Data ilegível no manifesto: ${campo}`, manifesto?.[campo]);
      linhas.push({ rotulo, data: null });
    } else {
      linhas.push({ rotulo, data });
    }
  }

  // Todas ilegíveis: o aviso persistente existente ocupa o lugar das datas (proposta, a registrar).
  if (linhas.every((l) => l.data === null)) {
    mostrarAviso('datas-indisponiveis', TEXTOS.datasIndisponiveis, { persistente: true });
    return;
  }

  const idades = [];
  for (const { rotulo, data } of linhas) {
    const linha = document.createElement('div');
    linha.className = 'datas-linha';
    if (!data) {
      linha.textContent = `${rotulo}: ${TEXTOS.dataIndisponivel}`;
    } else {
      const texto = document.createElement('span');
      texto.textContent = `${rotulo} ${formatarBrasilia(data)} · `;
      const idade = document.createElement('span');
      idade.className = 'datas-idade';
      linha.append(texto, idade);
      idades.push({ data, idade });
    }
    elemento.append(linha);
  }
  const atualizar = () => {
    const t = agora();
    for (const { data, idade } of idades) idade.textContent = idadeRelativa(data, t);
  };
  atualizar();
  setInterval(atualizar, DATAS.intervaloRecalculoMs);
  elemento.hidden = false;
}
