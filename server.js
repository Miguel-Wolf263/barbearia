'use strict';
const path = require('node:path');
const express = require('express');
const session = require('express-session');
const cfg = require('./config');
const { pool } = require('./db');

const app = express();
app.disable('x-powered-by');

app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'same-origin',
  });
  next();
});

app.use('/assets', express.static(path.join(__dirname, 'public', 'assets')));
app.use(express.urlencoded({ extended: false }));

app.use(session({
  name: cfg.SESSION_NAME,
  secret: cfg.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: cfg.COOKIE_SECURE },
}));

app.use('/', require('./routes/auth'));
app.use('/painel', require('./routes/painel'));
app.use('/clientes', require('./routes/clientes'));
app.use('/barbeiros', require('./routes/barbeiros'));
app.use('/servicos', require('./routes/servicos'));
app.use('/agendamentos', require('./routes/agendamentos'));

app.use((req, res) => {
  res.status(404).send('Página não encontrada.');
});

const ERROS_CONEXAO = ['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', 'PROTOCOL_CONNECTION_LOST',
  'ER_ACCESS_DENIED_ERROR', 'ER_BAD_DB_ERROR', 'ER_NO_SUCH_TABLE'];

app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return;
  if (ERROS_CONEXAO.includes(err.code)) {
    return res.status(500).send('Não foi possível acessar o banco de dados. Verifique o arquivo .env e se o script saep_db.sql foi importado.');
  }
  res.status(500).send('Erro interno do servidor.');
});

if (require.main === module) {
  if (!cfg.SESSION_SECRET_DEFINIDO) {
    console.warn('Aviso: SESSION_SECRET não definido; usando um segredo temporário (as sessões se perdem ao reiniciar).');
  }
  pool.query('SELECT 1').catch((err) => {
    console.error(`Aviso: não foi possível conectar ao MySQL (${err.code || err.message}). Confira o .env e importe o saep_db.sql.`);
  });
  app.listen(cfg.PORT, () => {
    console.log(`Navalha Real rodando em http://localhost:${cfg.PORT}`);
  });
}

module.exports = app;
