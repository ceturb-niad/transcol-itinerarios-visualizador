// Medição de desempenho de "Ligar tudo" (4.3 T2). Ativada só com ?medir; expõe
// window.medirSelecao() no console. Compara dois mecanismos de seleção:
//   filtro: setFilter por `chave` nas duas camadas (mecanismo de produção);
//   fonte:  camadas sem filtro e source.setData com só as features ligadas.
// Não define limiar; só registra valores.
import { FONTE, CAMADAS } from './mapa-itinerarios.js';
import { VISTA_INICIAL } from './config.js';

const idle = (mapa) => new Promise((ok) => { mapa.once('idle', ok); mapa.triggerRepaint(); });

async function tempo(mapa, acao) {
  const t0 = performance.now();
  acao();
  await idle(mapa);
  return Math.round(performance.now() - t0);
}

// FPS médio durante um zoom de ida e volta, com o que estiver ligado.
async function fps(mapa) {
  let quadros = 0;
  let rodando = true;
  const contar = () => { quadros += 1; if (rodando) requestAnimationFrame(contar); };
  const t0 = performance.now();
  requestAnimationFrame(contar);
  for (const zoom of [VISTA_INICIAL.zoom + 1.5, VISTA_INICIAL.zoom]) {
    mapa.easeTo({ zoom, duration: 1500 });
    await new Promise((ok) => mapa.once('moveend', ok));
  }
  rodando = false;
  return Math.round((quadros / (performance.now() - t0)) * 1000 * 10) / 10;
}

export function prepararMedicao(mapa, geojson, aplicarFiltro) {
  const todas = geojson.features.map((f) => f.properties.chave);
  const vazio = { type: 'FeatureCollection', features: [] };

  const mecanismos = {
    filtro: {
      ligar: () => aplicarFiltro(todas),
      limpar: () => aplicarFiltro([]),
      entrar() {},
      sair() { aplicarFiltro([]); },
    },
    fonte: {
      ligar: () => mapa.getSource(FONTE).setData(geojson),
      limpar: () => mapa.getSource(FONTE).setData(vazio),
      entrar() {
        for (const id of CAMADAS) mapa.setFilter(id, null);
        mapa.getSource(FONTE).setData(vazio);
      },
      sair() {
        mapa.getSource(FONTE).setData(geojson);
        aplicarFiltro([]);
      },
    },
  };

  window.medirSelecao = async () => {
    const linhas = {};
    for (const [nome, m] of Object.entries(mecanismos)) {
      m.entrar();
      await idle(mapa);
      linhas[nome] = {
        'ligar tudo (ms)': await tempo(mapa, m.ligar),
        'fps com tudo ligado': await fps(mapa),
        'limpar (ms)': await tempo(mapa, m.limpar),
      };
      m.sair();
      await idle(mapa);
    }
    console.table(linhas);
    console.info(`${todas.length} features; ${navigator.userAgent}`);
    return linhas;
  };
  console.info('Modo de medição: rode `await medirSelecao()` no console (mapa parado, sem selecionar nada).');
}
