'use strict';
const { e } = require('../lib/funcoes');

const MENU = [
  ['painel', '/painel', 'Painel'],
  ['agendamentos', '/agendamentos', 'Agendamentos'],
  ['clientes', '/clientes', 'Clientes'],
  ['barbeiros', '/barbeiros', 'Barbeiros'],
  ['servicos', '/servicos', 'Serviços'],
];

module.exports = function layout({ titulo, pagina, usuario, flash, corpo }) {
  const menu = MENU.map(([chave, url, rotulo]) =>
    `<a href="${url}"${chave === pagina ? ' class="ativo" aria-current="page"' : ''}>${rotulo}</a>`).join('\n      ');

  const alerta = flash
    ? `<div class="alerta alerta-${e(flash.tipo)}" role="status">${e(flash.msg)}</div>`
    : '';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${e(titulo)} · Navalha Real</title>
<link rel="stylesheet" href="/assets/style.css">
</head>
<body>
<header class="topo">
  <div class="poste" aria-hidden="true"></div>
  <div class="topo-barra">
    <a class="marca" href="/painel">Navalha Real</a>
    <nav class="menu" aria-label="Menu principal">
      ${menu}
    </nav>
    <div class="usuario">
      <span>Olá, <strong>${e(usuario)}</strong></span>
      <a class="btn btn-sair" href="/logout">Sair</a>
    </div>
  </div>
</header>
<main class="conteudo">
${alerta}
${corpo}
</main>
<footer class="rodape">Navalha Real · Sistema de gestão e agendamento · Dados sensíveis protegidos conforme a LGPD</footer>
</body>
</html>`;
};
