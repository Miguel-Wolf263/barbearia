'use strict';
const { e } = require('../lib/funcoes');

module.exports = function loginView({ erro, aviso, email }) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Entrar · Navalha Real</title>
<link rel="stylesheet" href="/assets/style.css">
</head>
<body class="pagina-login">
<div class="login-grade">
  <div class="login-poste" aria-hidden="true"></div>
  <section class="login-painel">
    <h1>Navalha Real</h1>
    <p class="login-sub">Entre para organizar a agenda, os clientes e os barbeiros.</p>

    ${erro ? `<div class="alerta alerta-erro" role="alert">${e(erro)}</div>` : ''}
    ${aviso ? `<div class="alerta alerta-info" role="status">${e(aviso)}</div>` : ''}

    <form method="post" action="/login" novalidate>
      <label for="email">E-mail</label>
      <input type="email" id="email" name="email" value="${e(email)}" autocomplete="username" autofocus>
      <label for="senha">Senha</label>
      <input type="password" id="senha" name="senha" autocomplete="current-password">
      <button class="btn btn-principal btn-largo" type="submit">Entrar</button>
    </form>
  </section>
</div>
</body>
</html>`;
};
