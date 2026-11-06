// Confere os dados publicados contra o contrato v1. Sob demanda: npm run verificar-dados
// (não termina em .test.js, então `npm test` não o executa nem depende da rede).
import { carregarItinerarios } from '../js/dados.js';

const CAMPOS = ['caminho', 'grupo', 'subgrupo', 'pasta_linha', 'linha', 'nome', 'codigo', 'sentido', 'variante', 'obs', 'chave'];
const ESPERADO_FEATURES = 1112; // medição de 05/11/2026 (especificação 3.2)
const ESPERADO_PARES = 457;

const { geojson, manifesto, falhas } = await carregarItinerarios();
if (falhas.manifesto) console.error('FALHA manifesto:', falhas.manifesto.message);
if (falhas.geojson) {
  console.error('FALHA GeoJSON:', falhas.geojson.message);
  process.exit(2);
}

const problemas = [];
const informes = [];
const features = geojson.features;

if (manifesto) {
  informes.push(`manifesto: n_features=${manifesto.n_features}, hash_origem=${manifesto.hash_origem}, atualizado=${manifesto.dados_atualizados_em}`);
  if (manifesto.n_features !== features.length) problemas.push(`n_features do manifesto (${manifesto.n_features}) ≠ features (${features.length})`);
}
if (features.length !== ESPERADO_FEATURES) problemas.push(`features: ${features.length} (esperado ${ESPERADO_FEATURES})`);

const chaves = new Set();
const pares = new Map();
let foraDoPlanoBasico = 0;
for (const f of features) {
  const p = f.properties ?? {};
  if (f.geometry?.type !== 'LineString') problemas.push(`geometria não LineString: ${p.chave}`);
  else if (f.geometry.coordinates.some((c) => c.length !== 2)) problemas.push(`coordenada não 2D: ${p.chave}`);
  for (const c of CAMPOS) if (!(c in p)) problemas.push(`campo ausente "${c}": ${p.chave}`);
  for (const c of ['linha', 'nome', 'chave']) {
    if (typeof p[c] !== 'string' || p[c].trim() === '') problemas.push(`"${c}" vazio: ${p.chave}`);
  }
  if (chaves.has(p.chave)) problemas.push(`chave repetida: ${p.chave}`);
  chaves.add(p.chave);
  const par = `${p.grupo}|${p.linha}`;
  pares.set(par, (pares.get(par) ?? 0) + 1);
  for (const c of ['nome', 'linha', 'grupo', 'subgrupo']) {
    if (typeof p[c] === 'string' && [...p[c]].some((ch) => ch.codePointAt(0) > 0xffff)) {
      foraDoPlanoBasico++;
      problemas.push(`caractere fora do plano básico em "${c}": ${p.chave}`);
    }
  }
}

if (pares.size !== ESPERADO_PARES) problemas.push(`pares (grupo, linha): ${pares.size} (esperado ${ESPERADO_PARES})`);
const maiores = [...pares].sort((a, b) => b[1] - a[1]).slice(0, 3);
informes.push(`features: ${features.length}; chaves únicas: ${chaves.size}; pares: ${pares.size}`);
informes.push(`maiores pares: ${maiores.map(([k, n]) => `${k}=${n}`).join('; ')}`);
informes.push(`caracteres fora do plano básico: ${foraDoPlanoBasico}`);

console.log(informes.join('\n'));
if (problemas.length) {
  console.error(`\n${problemas.length} divergência(s):\n- ${problemas.slice(0, 30).join('\n- ')}`);
  process.exit(1);
}
console.log('\nContrato conferido sem divergências.');
