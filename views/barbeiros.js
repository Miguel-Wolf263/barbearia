'use strict';
const { e, csrfCampo, formatarCpf, formatarTelefone, mascararCpf } = require('../lib/funcoes');

module.exports = function barbeirosView({ form, erros, barbeiros, csrf }) {
  const linhas = barbeiros.map((b) => `
        <tr>
          <td>${e(b.nome)}</td>
          <td>${e(mascararCpf(b.cpf))}</td>
          <td>${e(formatarTelefone(b.telefone))}</td>
          <td>${e(b.especialidade ?? '—')}</td>
          <td class="col-acoes">
            <a class="btn btn-pequeno" href="/barbeiros?editar=${Number(b.id)}">Editar</a>
            <form method="post" action="/barbeiros" onsubmit="return confirm('Excluir este barbeiro?');">
              ${csrfCampo(csrf)}<input type="hidden" name="acao" value="excluir"><input type="hidden" name="id" value="${Number(b.id)}">
              <button class="btn btn-pequeno btn-perigo" type="submit">Excluir</button>
            </form>
          </td>
        </tr>`).join('');

  const lista = barbeiros.length === 0
    ? '<p class="vazio">Nenhum barbeiro cadastrado ainda.</p>'
    : `<div class="tabela-rolagem"><table>
      <thead><tr><th>Nome</th><th>CPF</th><th>Telefone</th><th>Especialidade</th><th class="col-acoes">Ações</th></tr></thead>
      <tbody>${linhas}
      </tbody>
    </table></div>`;

  return `<h1>Barbeiros</h1>
<p class="lead">Equipe que atende na barbearia. Cada serviço precisa de um barbeiro responsável.</p>

<div class="duas-colunas">
  <section class="bloco">
    <h2>${form.id ? 'Editar barbeiro' : 'Novo barbeiro'}</h2>
    ${erros.map((m) => `<div class="alerta alerta-erro" role="alert">${e(m)}</div>`).join('')}
    <form method="post" action="/barbeiros" novalidate>
      ${csrfCampo(csrf)}
      <input type="hidden" name="acao" value="salvar">
      <input type="hidden" name="id" value="${Number(form.id)}">
      <label for="nome">Nome completo</label>
      <input id="nome" name="nome" value="${e(form.nome)}" maxlength="100">
      <label for="cpf">CPF</label>
      <input id="cpf" name="cpf" value="${e(formatarCpf(form.cpf))}" maxlength="14" inputmode="numeric" placeholder="000.000.000-00">
      <label for="telefone">Telefone</label>
      <input id="telefone" name="telefone" value="${e(formatarTelefone(form.telefone))}" maxlength="15" inputmode="tel" placeholder="(47) 99999-9999">
      <label for="especialidade">Especialidade (opcional)</label>
      <input id="especialidade" name="especialidade" value="${e(form.especialidade)}" maxlength="80" placeholder="Ex.: degradê, barba, platinado">
      <div class="acoes">
        <button class="btn btn-principal" type="submit">${form.id ? 'Salvar alterações' : 'Cadastrar barbeiro'}</button>
        ${form.id ? '<a class="btn" href="/barbeiros">Cancelar</a>' : ''}
      </div>
    </form>
  </section>

  <section class="bloco">
    <h2>Equipe</h2>
    ${lista}
  </section>
</div>`;
};
