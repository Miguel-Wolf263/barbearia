'use strict';
const crypto = require('node:crypto');
const cfg = require('../config');

function destruirSessao(req, res) {
  return new Promise((resolve) => {
    req.session.destroy(() => {
      res.clearCookie(cfg.SESSION_NAME);
      resolve();
    });
  });
}

async function exigirLogin(req, res, next) {
  try {
    if (!req.session.usuario_id) return res.redirect('/login');
    if (Date.now() - (req.session.ultimo_acesso || 0) > cfg.SESSAO_TEMPO * 1000) {
      await destruirSessao(req, res);
      return res.redirect('/login?expirou=1');
    }
    req.session.ultimo_acesso = Date.now();
    next();
  } catch (err) {
    next(err);
  }
}

function csrfValidar(req, res, next) {
  const enviado = typeof req.body?.csrf === 'string' ? req.body.csrf : '';
  const esperado = req.session?.csrf || '';
  const a = Buffer.from(enviado);
  const b = Buffer.from(esperado);
  if (!esperado || a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(400).send('Requisição inválida (token de segurança incorreto). Volte e tente novamente.');
  }
  next();
}

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { exigirLogin, csrfValidar, destruirSessao, wrap };
