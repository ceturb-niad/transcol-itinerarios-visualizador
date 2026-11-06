// Avisos sobrepostos ao mapa, sem alert() (DEC-F15). Mensagens em um painel; o aviso
// persistente de datas indisponíveis fica em #datas, onde as datas aparecerão.
const avisos = new Map(); // id -> elemento

let painel = null;
let datas = null;

export function iniciarAvisos(contenedor) {
  datas = document.createElement('div');
  datas.id = 'datas';
  datas.className = 'datas';
  datas.hidden = true;

  painel = document.createElement('div');
  painel.className = 'avisos';
  painel.setAttribute('role', 'status');
  painel.setAttribute('aria-live', 'polite');

  contenedor.append(datas, painel);
}

// Idempotente por id: repetir não duplica. `persistente` vai para #datas, sem botão de fechar.
export function mostrarAviso(id, texto, { persistente = false } = {}) {
  if (avisos.has(id)) return;
  const el = document.createElement('div');
  el.className = persistente ? 'aviso-datas' : 'aviso';
  const span = document.createElement('span');
  span.textContent = texto;
  el.append(span);
  if (persistente) {
    datas.append(el);
    datas.hidden = false;
  } else {
    const fechar = document.createElement('button');
    fechar.type = 'button';
    fechar.textContent = '×';
    fechar.setAttribute('aria-label', 'Dispensar aviso');
    // O id continua registrado: o aviso dispensado não volta a cada tile que falha.
    fechar.addEventListener('click', () => el.remove());
    el.append(fechar);
    painel.append(el);
  }
  avisos.set(id, el);
}

export function removerAviso(id) {
  const el = avisos.get(id);
  if (!el) return;
  el.remove();
  avisos.delete(id);
  if (datas && datas.childElementCount === 0) datas.hidden = true;
}
