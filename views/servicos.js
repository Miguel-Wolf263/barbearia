'use strict';
const { e, csrfCampo, dinheiro } = require('../lib/funcoes');

module.exports = function servicosView({ form, erros, servicos, barbeirosLista, csrf }) {
  const linhas = servicos.map((s) => `
        <tr>
          <td>${e(s.nome)}${s.descricao ? `<br><small>${e(s.descricao)}</small>` : ''}</td>
          <td>${e(dinheiro(s.preco))}</td>
          <td>${Number(s.duracao_min)} min</td>
          <td>${e(s.barbeiro)}</td>
          <td class="col-acoes">
            <a class="btn btn-pequeno" href="/servicos?editar=${Number(s.id)}">Editar</a>
            <form method="post" action="/servicos" onsubmit="return confirm('Excluir este serviço?');">
              ${csrfCampo(csrf)}<input type="hidden" name="acao" value="excluir"><input type="hidden" name="id" value="${Number(s.id)}">
              <button class="btn btn-pequeno btn-perigo" type="submit">Excluir</button>
            </form>
          </td>
        </tr>`).join('');

  const lista = servicos.length === 0
    ? '<p class="vazio">Nenhum serviço cadastrado ainda.</p>'
    : `<div class="tabela-rolagem"><table>
      <thead><tr><th>Serviço</th><th>Preço</th><th>Duração</th><th>Barbeiro</th><th class="col-acoes">Ações</th></tr></thead>
      <tbody>${linhas}
      </tbody>
    </table></div>`;

  const opcoes = barbeirosLista.map((b) =>
    `<option value="${Number(b.id)}"${Number(form.barbeiro_id) === Number(b.id) ? ' selected' : ''}>${e(b.nome)}</option>`).join('\n          ');

  const formulario = barbeirosLista.length === 0
    ? '<div class="alerta alerta-info">Cadastre um barbeiro antes de criar serviços. <a href="/barbeiros">Ir para Barbeiros</a>.</div>'
    : `<form method="post" action="/servicos" novalidate>
      ${csrfCampo(csrf)}
      <input type="hidden" name="acao" value="salvar">
      <input type="hidden" name="id" value="${Number(form.id)}">
      <label for="nome">Nome do serviço</label>
      <input id="nome" name="nome" value="${e(form.nome)}" maxlength="80" placeholder="Ex.: Corte degradê">
      <label for="descricao">Descrição (opcional)</label>
      <input id="descricao" name="descricao" value="${e(form.descricao)}" maxlength="200">
      <div class="linha-dupla">
        <div><label for="preco">Preço (R$)</label>
          <input id="preco" name="preco" value="${e(form.preco)}" inputmode="decimal" placeholder="45,00"></div>
        <div><label for="duracao_min">Duração (min)</label>
          <input id="duracao_min" name="duracao_min" value="${e(form.duracao_min)}" inputmode="numeric"></div>
      </div>
      <label for="barbeiro_id">Barbeiro responsável</label>
      <select id="barbeiro_id" name="barbeiro_id">
        <option value="0">Selecione um barbeiro…</option>
        ${opcoes}
      </select>
      <div class="acoes">
        <button class="btn btn-principal" type="submit">${form.id ? 'Salvar alterações' : 'Cadastrar serviço'}</button>
        ${form.id ? '<a class="btn" href="/servicos">Cancelar</a>' : ''}
      </div>
    </form>`;

  return `<h1>Serviços</h1>
<p class="lead">Cortes e tratamentos oferecidos, cada um com seu barbeiro responsável.</p>

<div class="duas-colunas">
  <section class="bloco">
    <h2>${form.id ? 'Editar serviço' : 'Novo serviço'}</h2>
    ${erros.map((m) => `<div class="alerta alerta-erro" role="alert">${e(m)}</div>`).join('')}
    ${formulario}
  </section>

  <section class="bloco">
    <h2>Catálogo</h2>
    ${lista}
  </section>
</div>`;
};
