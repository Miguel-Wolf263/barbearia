'use strict';
const { e, dataHoraBr } = require('../lib/funcoes');

module.exports = function painelView({ nome, total, proximos }) {
  const primeiroNome = String(nome || '').split(' ')[0];

  const tabela = proximos.length === 0
    ? '<p class="vazio">Nenhum atendimento marcado. <a href="/agendamentos">Agende o primeiro horário</a>.</p>'
    : `<div class="tabela-rolagem"><table>
    <thead><tr><th>Quando</th><th>Cliente</th><th>Serviço</th><th>Barbeiro</th></tr></thead>
    <tbody>
    ${proximos.map((p) => `<tr><td>${e(dataHoraBr(p.data_hora))}</td><td>${e(p.cliente)}</td><td>${e(p.servico)}</td><td>${e(p.barbeiro)}</td></tr>`).join('\n    ')}
    </tbody>
  </table></div>`;

  return `<h1>Bom trabalho, ${e(primeiroNome)}.</h1>
<p class="lead">Resumo da barbearia e atalhos para o dia a dia.</p>

<section class="atalhos">
  <a class="atalho" href="/agendamentos"><span class="num">${Number(total.agendamentos)}</span><span>atendimentos por vir</span></a>
  <a class="atalho" href="/clientes"><span class="num">${Number(total.clientes)}</span><span>clientes cadastrados</span></a>
  <a class="atalho" href="/barbeiros"><span class="num">${Number(total.barbeiros)}</span><span>barbeiros na equipe</span></a>
  <a class="atalho" href="/servicos"><span class="num">${Number(total.servicos)}</span><span>serviços no catálogo</span></a>
</section>

<section class="bloco">
  <h2>Próximos atendimentos</h2>
  ${tabela}
</section>`;
};
