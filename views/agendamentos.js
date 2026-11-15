'use strict';
const { e, csrfCampo, dinheiro, formatarTelefone, dataBr, horaBr } = require('../lib/funcoes');

const STATUS = ['Agendado', 'Concluído', 'Cancelado'];

// 'Concluído' -> 'concluido' (classe CSS do selo)
const classeStatus = (s) => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

module.exports = function agendamentosView({ form, erros, clientesLista, servicosLista, lista, csrf }) {
  const linhas = lista.map((a) => `
        <tr>
          <td><strong>${e(dataBr(a.data_hora))}</strong><br>${e(horaBr(a.data_hora))}</td>
          <td>${e(a.cliente)}<br><small>${e(formatarTelefone(a.cliente_tel))}</small></td>
          <td>${e(a.servico)}<br><small>${e(dinheiro(a.preco))} · ${Number(a.duracao_min)} min</small></td>
          <td>${e(a.barbeiro)}</td>
          <td><span class="selo selo-${e(classeStatus(a.status))}">${e(a.status)}</span></td>
          <td class="col-acoes">
            <a class="btn btn-pequeno" href="/agendamentos?editar=${Number(a.id)}">Editar</a>
            <form method="post" action="/agendamentos" onsubmit="return confirm('Excluir este agendamento?');">
              ${csrfCampo(csrf)}<input type="hidden" name="acao" value="excluir"><input type="hidden" name="id" value="${Number(a.id)}">
              <button class="btn btn-pequeno btn-perigo" type="submit">Excluir</button>
            </form>
          </td>
        </tr>`).join('');

  const tabela = lista.length === 0
    ? '<p class="vazio">Nenhum atendimento marcado ainda.</p>'
    : `<div class="tabela-rolagem"><table>
      <thead><tr><th>Dia e horário</th><th>Cliente</th><th>Serviço</th><th>Barbeiro</th><th>Situação</th><th class="col-acoes">Ações</th></tr></thead>
      <tbody>${linhas}
      </tbody>
    </table></div>`;

  const optClientes = clientesLista.map((c) =>
    `<option value="${Number(c.id)}"${Number(form.cliente_id) === Number(c.id) ? ' selected' : ''}>${e(c.nome)}</option>`).join('\n          ');
  const optServicos = servicosLista.map((s) =>
    `<option value="${Number(s.id)}"${Number(form.servico_id) === Number(s.id) ? ' selected' : ''}>${e(`${s.nome} · ${s.barbeiro} · ${s.duracao_min} min`)}</option>`).join('\n          ');

  const campoStatus = form.id
    ? `<label for="status">Situação</label>
      <select id="status" name="status">
        ${STATUS.map((st) => `<option${form.status === st ? ' selected' : ''}>${e(st)}</option>`).join('')}
      </select>`
    : '<input type="hidden" name="status" value="Agendado">';

  const formulario = (clientesLista.length === 0 || servicosLista.length === 0)
    ? '<div class="alerta alerta-info">Para agendar é preciso ter ao menos um <a href="/clientes">cliente</a> e um <a href="/servicos">serviço</a> cadastrados.</div>'
    : `<form method="post" action="/agendamentos" novalidate>
      ${csrfCampo(csrf)}
      <input type="hidden" name="acao" value="salvar">
      <input type="hidden" name="id" value="${Number(form.id)}">
      <label for="cliente_id">Cliente</label>
      <select id="cliente_id" name="cliente_id">
        <option value="0">Selecione o cliente…</option>
        ${optClientes}
      </select>
      <label for="servico_id">Serviço (com barbeiro responsável)</label>
      <select id="servico_id" name="servico_id">
        <option value="0">Selecione o serviço…</option>
        ${optServicos}
      </select>
      <label for="data_hora">Dia e horário</label>
      <input id="data_hora" name="data_hora" type="datetime-local" step="900" value="${e(form.data_hora)}">
      ${campoStatus}
      <label for="observacao">Observação (opcional)</label>
      <input id="observacao" name="observacao" value="${e(form.observacao)}" maxlength="200">
      <div class="acoes">
        <button class="btn btn-principal" type="submit">${form.id ? 'Salvar alterações' : 'Agendar horário'}</button>
        ${form.id ? '<a class="btn" href="/agendamentos">Cancelar</a>' : ''}
      </div>
    </form>`;

  return `<h1>Agendamentos</h1>
<p class="lead">Atendimentos marcados, em ordem de dia e horário.</p>

<div class="duas-colunas">
  <section class="bloco">
    <h2>${form.id ? 'Editar agendamento' : 'Novo agendamento'}</h2>
    ${erros.map((m) => `<div class="alerta alerta-erro" role="alert">${e(m)}</div>`).join('')}
    ${formulario}
  </section>

  <section class="bloco">
    <h2>Agenda</h2>
    ${tabela}
  </section>
</div>`;
};
