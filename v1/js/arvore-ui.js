// Árvore lateral (DEC-F17, DEC-F19, DEC-F29). Monta o DOM a partir do modelo de arvore.js.
// Grupo, subgrupo e linha só expandem e recolhem; tudo abre recolhido. A identidade fica em
// atributos data-, nunca em `id` nem em seletor (DEC-F22). Textos entram por textContent.

function listaDe(...itens) {
  const ul = document.createElement('ul');
  ul.className = 'arvore-lista';
  ul.append(...itens);
  return ul;
}

// Nó expansível: botão com o rótulo e uma lista de filhos escondida.
function criarNo(nivel, rotulo, dados, filhos) {
  const li = document.createElement('li');
  li.className = `arvore-no arvore-${nivel}`;
  const botao = document.createElement('button');
  botao.type = 'button';
  botao.className = 'arvore-botao';
  botao.setAttribute('aria-expanded', 'false');
  Object.assign(botao.dataset, dados);
  botao.dataset.nivel = nivel;
  const seta = document.createElement('span');
  seta.className = 'arvore-seta';
  seta.setAttribute('aria-hidden', 'true');
  const texto = document.createElement('span');
  texto.textContent = rotulo;
  botao.append(seta, texto);
  const sub = listaDe(...filhos);
  sub.hidden = true;
  li.append(botao, sub);
  return li;
}

function criarFeature(feature) {
  const li = document.createElement('li');
  li.className = 'arvore-feature';
  li.dataset.chave = feature.properties.chave;
  const amostra = document.createElement('span');
  amostra.className = 'arvore-amostra';
  amostra.style.background = feature.properties._cor ?? 'transparent';
  const texto = document.createElement('span');
  texto.textContent = feature.properties.nome;
  li.append(amostra, texto);
  return li;
}

function criarLinha(par) {
  const dados = { grupo: par.grupo, linha: par.linha };
  if (par.subgrupo !== null) dados.subgrupo = par.subgrupo;
  return criarNo('linha', par.linha, dados, par.features.map(criarFeature));
}

// Devolve o elemento raiz da árvore, já inserido em `contenedor`.
export function criarArvore(contenedor, modelo) {
  const raiz = listaDe(...modelo.grupos.map((g) => {
    const filhos = [
      ...g.subgrupos.map((s) =>
        criarNo('subgrupo', s.nome, { grupo: g.nome, subgrupo: s.nome }, s.linhas.map(criarLinha))),
      ...g.linhas.map(criarLinha),
    ];
    return criarNo('grupo', g.nome, { grupo: g.nome }, filhos);
  }));
  raiz.classList.add('arvore');
  raiz.setAttribute('role', 'tree');
  raiz.setAttribute('aria-label', 'Linhas');

  // Delegação: um único ouvinte para todos os nós.
  raiz.addEventListener('click', (evento) => {
    const botao = evento.target.closest('.arvore-botao');
    if (!botao) return;
    const aberto = botao.getAttribute('aria-expanded') === 'true';
    botao.setAttribute('aria-expanded', String(!aberto));
    botao.nextElementSibling.hidden = aberto;
  });

  contenedor.append(raiz);
  return raiz;
}
