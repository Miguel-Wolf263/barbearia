'use strict';
const crypto = require('node:crypto');

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };

function e(v) {
  return String(v ?? '').replace(/[&<>"']/g, (c) => ESC[c]);
}

function str(v) {
  return typeof v === 'string' ? v : '';
}

function inteiro(v) {
  const n = parseInt(str(v), 10);
  return Number.isInteger(n) && n > 0 ? n : 0;
}

function somenteDigitos(v) {
  return String(v ?? '').replace(/\D+/g, '');
}

function validarCpf(valor) {
  const cpf = somenteDigitos(valor);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  for (let t = 9; t < 11; t++) {
    let d = 0;
    let c;
    for (c = 0; c < t; c++) d += Number(cpf[c]) * ((t + 1) - c);
    d = ((10 * d) % 11) % 10;
    if (Number(cpf[c]) !== d) return false;
  }
  return true;
}

function formatarCpf(cpf) {
  const c = somenteDigitos(cpf);
  if (c.length !== 11) return String(cpf ?? '');
  return `${c.slice(0, 3)}.${c.slice(3, 6)}.${c.slice(6, 9)}-${c.slice(9)}`;
}

function mascararCpf(cpf) {
  const c = somenteDigitos(cpf);
  if (c.length !== 11) return '—';
  return `***.${c.slice(3, 6)}.${c.slice(6, 9)}-**`;
}

function formatarTelefone(tel) {
  const t = somenteDigitos(tel);
  if (t.length === 11) return `(${t.slice(0, 2)}) ${t.slice(2, 7)}-${t.slice(7)}`;
  if (t.length === 10) return `(${t.slice(0, 2)}) ${t.slice(2, 6)}-${t.slice(6)}`;
  return String(tel ?? '');
}

function dinheiro(v) {
  const [inteira, dec] = Number(v || 0).toFixed(2).split('.');
  return `R$ ${inteira.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${dec}`;
}

const pad = (n) => String(n).padStart(2, '0');
const RE_DATAHORA = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/;

function dataBr(s) {
  const m = RE_DATAHORA.exec(String(s ?? ''));
  return m ? `${m[3]}/${m[2]}/${m[1]}` : '';
}

function horaBr(s) {
  const m = RE_DATAHORA.exec(String(s ?? ''));
  return m ? `${m[4]}:${m[5]}` : '';
}

function dataHoraBr(s) {
  const d = dataBr(s);
  return d ? `${d} às ${horaBr(s)}` : '';
}

function paraInputLocal(s) {
  const m = RE_DATAHORA.exec(String(s ?? ''));
  return m ? `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}` : '';
}

function lerDataHoraLocal(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(String(s ?? ''));
  if (!m) return null;
  const [a, mes, d, h, mi] = m.slice(1).map(Number);
  const dt = new Date(a, mes - 1, d, h, mi, 0, 0);
  const ok = dt.getFullYear() === a && dt.getMonth() === mes - 1 && dt.getDate() === d
          && dt.getHours() === h && dt.getMinutes() === mi;
  return ok ? dt : null;
}

function paraMysql(dt) {
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())} `
       + `${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`;
}

function setFlash(req, tipo, msg) {
  req.session.flash = { tipo, msg };
}

function getFlash(req) {
  const f = req.session?.flash ?? null;
  if (f) delete req.session.flash;
  return f;
}

function csrfToken(req) {
  if (!req.session.csrf) req.session.csrf = crypto.randomBytes(32).toString('hex');
  return req.session.csrf;
}

function csrfCampo(token) {
  return `<input type="hidden" name="csrf" value="${e(token)}">`;
}

module.exports = {
  e, str, inteiro, somenteDigitos, validarCpf, formatarCpf, mascararCpf, formatarTelefone, dinheiro,
  dataBr, horaBr, dataHoraBr, paraInputLocal, lerDataHoraLocal, paraMysql,
  setFlash, getFlash, csrfToken, csrfCampo,
};
