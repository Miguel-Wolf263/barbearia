'use strict';
const express = require('express');
const bcrypt = require('bcryptjs');
const { q } = require('../db');
const { e, str } = require('../lib/funcoes');
const { destruirSessao, wrap } = require('../lib/auth');
const loginView = require('../views/login');

const router = express.Router();

router.get('/', (req, res) => {
  res.redirect(req.session.usuario_id ? '/painel' : '/login');
});

router.get('/login', (req, res) => {
  if (req.session.usuario_id) return res.redirect('/painel');
  let aviso = '';
  if ('expirou' in req.query) aviso = 'Sua sessão expirou por inatividade. Entre novamente.';
  if ('saiu' in req.query) aviso = 'Você saiu do sistema.';
  res.send(loginView({ erro: '', aviso, email: '' }));
});

router.post('/login', wrap(async (req, res) => {
  if (req.session.usuario_id) return res.redirect('/painel');

  const email = str(req.body.email).trim();
  const senha = str(req.body.senha);
  let erro = '';

  if (email === '' || senha === '') {
    erro = 'Informe o e-mail e a senha.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    erro = 'Digite um e-mail válido.';
  } else {
    const [u] = await q('SELECT id, nome, senha FROM usuarios WHERE email = ? LIMIT 1', [email]);
    if (u && await bcrypt.compare(senha, u.senha)) {
      // Novo ID de sessão após o login (evita fixação de sessão) – RNF04
      await new Promise((ok, falha) => req.session.regenerate((err) => (err ? falha(err) : ok())));
      req.session.usuario_id = Number(u.id);
      req.session.usuario_nome = u.nome;
      req.session.ultimo_acesso = Date.now();
      return res.redirect('/painel');
    }
    // Mensagem única para não revelar qual dos campos está errado
    erro = 'Usuário ou senha inválidos. Confira os dados e tente de novo.';
  }
  res.send(loginView({ erro, aviso: '', email }));
}));

router.get('/logout', wrap(async (req, res) => {
  await destruirSessao(req, res);
  res.redirect('/login?saiu=1');
}));

module.exports = router;
