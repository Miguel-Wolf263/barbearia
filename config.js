'use strict';
try { process.loadEnvFile(); } catch { /* sem .env: usa os padrões abaixo */ }

const env = process.env;

module.exports = {
  PORT: Number(env.PORT) || 3000,

  DB_HOST: env.DB_HOST || 'localhost',
  DB_PORT: Number(env.DB_PORT) || 3306,
  DB_NAME: env.DB_NAME || 'saep_db',
  DB_USER: env.DB_USER || 'root',
  DB_PASS: env.DB_PASS || '',

  CHAVE_CRIPTO: env.CHAVE_CRIPTO || 'saep_barbearia_chave_2025',

  SESSAO_TEMPO: Number(env.SESSAO_TEMPO) || 1800,

  SESSION_NAME: 'navalha.sid',
  SESSION_SECRET: env.SESSION_SECRET || require('node:crypto').randomBytes(32).toString('hex'),
  SESSION_SECRET_DEFINIDO: Boolean(env.SESSION_SECRET),
  COOKIE_SECURE: env.COOKIE_SECURE === 'true',
};
