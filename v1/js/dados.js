// Acesso aos dados isolado aqui (DEC-F13). Sem DOM; `fetch` pode ser injetado para teste.
import { DADOS } from './config.js';

// Devolve o hash de origem do manifesto ou lança Error (DEC-F25).
export function validarManifesto(obj) {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    throw new Error('manifesto não é um objeto JSON');
  }
  if (typeof obj.hash_origem !== 'string' || obj.hash_origem.trim() === '') {
    throw new Error('manifesto sem hash_origem');
  }
  return obj.hash_origem.trim();
}

// Lança Error se não for FeatureCollection com ao menos uma feature (DEC-F25).
// Propriedades desconhecidas são ignoradas (contrato aditivo, DEC-F16).
export function validarFeatureCollection(obj) {
  if (obj === null || typeof obj !== 'object' || obj.type !== 'FeatureCollection') {
    throw new Error('resposta não é uma FeatureCollection');
  }
  if (!Array.isArray(obj.features) || obj.features.length === 0) {
    throw new Error('FeatureCollection sem features');
  }
  return obj;
}

async function buscarJson(fetchFn, url, opcoes) {
  const resp = await fetchFn(url, opcoes);
  if (!resp.ok) throw new Error(`HTTP ${resp.status} em ${url}`);
  try {
    return await resp.json();
  } catch {
    throw new Error(`resposta de ${url} não é JSON válido`);
  }
}

// Nunca lança: cada falha vira `falhas.<parte>` (Error) e a parte correspondente fica null.
// Sem hash válido, o GeoJSON é buscado sem `?v=` (DEC-F25).
export async function carregarItinerarios({ fetchFn = globalThis.fetch, dados = DADOS } = {}) {
  const resultado = {
    geojson: null,
    manifesto: null,
    falhas: { manifesto: null, geojson: null },
  };

  let hash = null;
  try {
    const manifesto = await buscarJson(fetchFn, dados.urlBase + dados.manifesto, { cache: 'no-store' });
    hash = validarManifesto(manifesto);
    resultado.manifesto = manifesto;
  } catch (erro) {
    resultado.falhas.manifesto = erro;
    console.warn('Falha ao obter o manifesto:', erro);
  }

  const urlGeojson = dados.urlBase + dados.geojson + (hash ? `?v=${encodeURIComponent(hash)}` : '');
  try {
    resultado.geojson = validarFeatureCollection(await buscarJson(fetchFn, urlGeojson));
  } catch (erro) {
    resultado.falhas.geojson = erro;
    console.warn('Falha ao obter os itinerários:', erro);
  }

  return resultado;
}
