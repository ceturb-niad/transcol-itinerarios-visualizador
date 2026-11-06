// Árvore lateral (DEC-F17, DEC-F19, DEC-F29). Monta o DOM a partir do modelo de arvore.js.
// Grupo, subgrupo e linha só expandem e recolhem; tudo abre recolhido. A identidade fica em
// atributos data-, nunca em `id` nem em seletor (DEC-F22). Textos entram por textContent.

// Nó do DOM por objeto do modelo (par, grupo, subgrupo): referências, sem texto concatenado.
function novoRegistro() {
  return { grupos: new Map(), subgrupos: new Map(), pares: new Map(), caixasLinha: new Map(), caixasFeature: new Map() };
}

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

// Caixa de seleção; identidade só em data-, nunca em `id` (DEC-F22).
function criarCaixa(rotulo, dados) {
  const caixa = document.createElement('input');
  caixa.type = 'checkbox';
  caixa.className = 'arvore-caixa';
  caixa.setAttribute('aria-label', rotulo);
  Object.assign(caixa.dataset, dados);
  return caixa;
}

function criarFeature(feature, registro) {
  const li = document.createElement('li');
  li.className = 'arvore-feature';
  li.dataset.chave = feature.properties.chave;
  const caixa = criarCaixa(`Ligar ${feature.properties.nome}`, { chave: feature.properties.chave });
  registro.caixasFeature.set(feature.properties.chave, caixa);
  li.append(caixa);
  const amostra = document.createElement('span');
  amostra.className = 'arvore-amostra';
  amostra.style.background = feature.properties._cor ?? 'transparent';
  const texto = document.createElement('span');
  texto.textContent = feature.properties.nome;
  li.append(amostra, texto);
  return li;
}

function criarLinha(par, registro) {
  const dados = { grupo: par.grupo, linha: par.linha };
  if (par.subgrupo !== null) dados.subgrupo = par.subgrupo;
  const no = criarNo('linha', par.linha, dados, par.features.map((f) => criarFeature(f, registro)));
  const caixa = criarCaixa(`Ligar todas as features da linha ${par.linha}`, dados);
  no.prepend(caixa);
  registro.caixasLinha.set(caixa, par);
  registro.pares.set(par, no);
  return no;
}

// Alterna a expansão de um nó (botão + lista de filhos).
function definirExpandido(no, aberto) {
  const botao = no.querySelector(':scope > .arvore-botao');
  botao.setAttribute('aria-expanded', String(aberto));
  botao.nextElementSibling.hidden = !aberto;
}

// Devolve { raiz, aplicarFiltro }. A árvore já fica inserida em `contenedor`.
export function criarArvore(contenedor, modelo, selecao) {
  const registro = novoRegistro();
  const raiz = listaDe(...modelo.grupos.map((g) => {
    const filhos = [
      ...g.subgrupos.map((s) => {
        const no = criarNo('subgrupo', s.nome, { grupo: g.nome, subgrupo: s.nome },
          s.linhas.map((par) => criarLinha(par, registro)));
        registro.subgrupos.set(s, no);
        return no;
      }),
      ...g.linhas.map((par) => criarLinha(par, registro)),
    ];
    const no = criarNo('grupo', g.nome, { grupo: g.nome }, filhos);
    registro.grupos.set(g, no);
    return no;
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

  // Caixas de feature e de linha (grupo e subgrupo não têm caixa; DEC-F29).
  raiz.addEventListener('change', (evento) => {
    const caixa = evento.target;
    if (!caixa.classList.contains('arvore-caixa')) return;
    if (registro.caixasLinha.has(caixa)) selecao.alternarLinha(registro.caixasLinha.get(caixa));
    else selecao.alternarFeature(caixa.dataset.chave);
  });

  function sincronizarCaixas() {
    for (const [chave, caixa] of registro.caixasFeature) caixa.checked = selecao.estaLigada(chave);
    for (const [caixa, par] of registro.caixasLinha) {
      const estado = selecao.estadoLinha(par);
      caixa.checked = estado === 'todas';
      caixa.indeterminate = estado === 'algumas';
    }
  }
  selecao.aoMudar(sincronizarCaixas);

  // Estado manual de expansão guardado ao entrar no modo busca e devolvido ao sair (DEC-F23).
  // Expansões feitas durante a busca valem só até apagar o texto.
  let instantaneo = null;
  const todosNos = () => [...raiz.querySelectorAll('.arvore-no')];

  function sairDaBusca() {
    if (!instantaneo) return;
    for (const no of todosNos()) no.hidden = false;
    for (const [no, aberto] of instantaneo) definirExpandido(no, aberto);
    instantaneo = null;
  }

  // `achados`: Set de pares, ou null para remover o filtro. Devolve a quantidade de pares visíveis
  // (null sem filtro). Só mexe na visibilidade da árvore; a seleção não é tocada.
  function aplicarFiltro(achados) {
    if (achados === null) {
      sairDaBusca();
      return null;
    }
    if (!instantaneo) {
      instantaneo = new Map(todosNos().map((no) => [no, no.querySelector(':scope > .arvore-botao').getAttribute('aria-expanded') === 'true']));
    }
    const visivel = (pares) => pares.some((par) => achados.has(par));
    for (const g of modelo.grupos) {
      const noGrupo = registro.grupos.get(g);
      const comResultado = visivel([...g.linhas, ...g.subgrupos.flatMap((s) => s.linhas)]);
      noGrupo.hidden = !comResultado;
      if (comResultado) definirExpandido(noGrupo, true);
      for (const s of g.subgrupos) {
        const noSub = registro.subgrupos.get(s);
        const subComResultado = visivel(s.linhas);
        noSub.hidden = !subComResultado;
        if (subComResultado) definirExpandido(noSub, true);
      }
    }
    for (const [par, no] of registro.pares) {
      no.hidden = !achados.has(par);
      // Expandido até o nível da linha; as features ficam recolhidas.
      if (achados.has(par)) definirExpandido(no, false);
    }
    return achados.size;
  }

  contenedor.append(raiz);
  return { raiz, aplicarFiltro };
}
