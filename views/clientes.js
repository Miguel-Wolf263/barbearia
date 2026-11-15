'use strict';
const { e, csrfCampo, formatarCpf, formatarTelefone, mascararCpf } = require('../lib/funcoes');

module.exports = function clientesView({ form, erros, clientes, busca, csrf }) {
  const linhas = clientes.map((c) => `
        <tr>
          <td>${e(c.nome)}</td>
          <td>${e(mascararCpf(c.cpf))}</td>
          <td>${e(formatarTelefone(c.telefone))}</td>
          <td>${e(c.email ?? '—')}</td>
          <td class="col-acoes">
            <a class="btn btn-pequeno" href="/clientes?editar=${Number(c.id)}">Editar</a>
            <form method="post" action="/clientes" onsubmit="return confirm('Excluir este cliente?');">
              ${csrfCampo(csrf)}<input type="hidden" name="acao" value="excluir"><input type="hidden" name="id" value="${Number(c.id)}">
              <button class="btn btn-pequeno btn-perigo" type="submit">Excluir</button>
            </form>
          </td>
        </tr>`).join('');

  const lista = clientes.length === 0
    ? `<p class="vazio">${busca !== '' ? 'Nenhum cliente encontrado. Tente outro termo.' : 'Nenhum cliente cadastrado ainda.'}</p>`
    : `<div class="tabela-rolagem"><table>
      <thead><tr><th>Nome</th><th>CPF</th><th>Telefone</th><th>E-mail</th><th class="col-acoes">Ações</th></tr></thead>
      <tbody>${linhas}
      </tbody>
    </table></div>`;

  return `<h1>Clientes</h1>
<p class="lead">Cadastre quem frequenta a barbearia. O CPF é guardado criptografado.</p>

<div class="duas-colunas">
  <section class="bloco">
    <h2>${form.id ? 'Editar cliente' : 'Novo cliente'}</h2>
    ${erros.map((m) => `<div class="alerta alerta-erro" role="alert">${e(m)}</div>`).join('')}
    <form method="post" action="/clientes" novalidate>
      ${csrfCampo(csrf)}
      <input type="hidden" name="acao" value="salvar">
      <input type="hidden" name="id" value="${Number(form.id)}">
      <label for="nome">Nome completo</label>
      <input id="nome" name="nome" value="${e(form.nome)}" maxlength="100">
      <label for="cpf">CPF</label>
      <input id="cpf" name="cpf" value="${e(formatarCpf(form.cpf))}" maxlength="14" inputmode="numeric" placeholder="000.000.000-00">
      <label for="telefone">Telefone</label>
      <input id="telefone" name="telefone" value="${e(formatarTelefone(form.telefone))}" maxlength="15" inputmode="tel" placeholder="(47) 99999-9999">
      <label for="email">E-mail (opcional)</label>
      <input id="email" name="email" type="email" value="${e(form.email)}" maxlength="120">
      <div class="acoes">
        <button class="btn btn-principal" type="submit">${form.id ? 'Salvar alterações' : 'Cadastrar cliente'}</button>
        ${form.id ? '<a class="btn" href="/clientes">Cancelar</a>' : ''}
      </div>
    </form>
  </section>

  <section class="bloco">
    <h2>Lista de clientes</h2>
    <form class="busca" method="get" action="/clientes" role="search">
      <label class="sr" for="q">Buscar cliente</label>
      <input id="q" type="search" name="q" value="${e(busca)}" placeholder="Nome, CPF, telefone ou e-mail">
      <button class="btn btn-principal" type="submit">Buscar</button>
      ${busca !== '' ? '<a class="btn" href="/clientes">Limpar</a>' : ''}
    </form>
    ${busca !== '' ? `<p class="nota">${clientes.length} resultado(s) para “${e(busca)}”.</p>` : ''}

    ${lista}
  </section>
</div>`;
};
