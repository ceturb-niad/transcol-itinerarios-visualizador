// Datas do manifesto, sem DOM (DEC-F14, DEC-F26). O relógio é injetado em `agora`.
import { DATAS } from './config.js';
import { IDADE } from './mensagens.js';

const MIN = 60 * 1000;
const H = 60 * MIN;

// ISO 8601 em UTC com sufixo Z (contrato 3.3). Qualquer outra coisa é ilegível (null).
const ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

export function lerDataIso(texto) {
  if (typeof texto !== 'string' || !ISO_UTC.test(texto)) return null;
  const data = new Date(texto);
  return Number.isNaN(data.getTime()) ? null : data;
}

const formatador = new Intl.DateTimeFormat('pt-BR', {
  timeZone: DATAS.fuso,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

// "dd/mm/aaaa hh:mm:ss" no horário de Brasília, montado das partes (independe do separador do locale).
export function formatarBrasilia(data) {
  const p = Object.fromEntries(formatador.formatToParts(data).map(({ type, value }) => [type, value]));
  return `${p.day}/${p.month}/${p.year} ${p.hour}:${p.minute}:${p.second}`;
}

// Faixas da DEC-F26; N arredondado para baixo; idade negativa vale "menos de 1 min".
export function idadeRelativa(data, agora) {
  const ms = agora.getTime() - data.getTime();
  if (ms < MIN) return IDADE.menosDeUmMinuto;
  if (ms < H) return IDADE.minutos(Math.floor(ms / MIN));
  if (ms < 48 * H) return IDADE.horas(Math.floor(ms / H));
  return IDADE.dias(Math.floor(ms / (24 * H)));
}

// { absoluta, idade } ou null se o texto for ilegível.
export function descreverData(iso, agora) {
  const data = lerDataIso(iso);
  return data ? { absoluta: formatarBrasilia(data), idade: idadeRelativa(data, agora) } : null;
}
