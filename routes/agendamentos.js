'use strict';
const express = require('express');
const { q } = require('../db');
const { str, inteiro, lerDataHoraLocal, paraMysql, paraInputLocal, setFlash, csrfToken } = require('../lib/funcoes');
const { exigirLogin, csrfValidar, wrap } = require('../lib/auth');
const { render } = require('../lib/render');
const view = require('../views/agendamentos');

const router = express.Router();
router.use(exigirLogin);

const STATUS_VALIDOS = ['Agendado', 'Concluído', 'Cancelado'];
const formVazio = () => ({ id: 0, cliente_id: 0, servico_id: 0, data_hora: '', status: 'Agendado', observacao: '' });

async function pagina(req, res, form, erros) {
  const clientesLista = await q('SELECT id, nome FROM clientes ORDER BY nome');
  const servicosLista = await q(
    `SELECT s.id, s.nome, s.duracao_min, s.preco, b.nome AS barbeiro
       FROM servicos s JOIN barbeiros b ON b.id = s.barbeiro_id ORDER BY s.nome`
  );

  // Todos os atendimentos, ordenados por dia e horário, com cliente, serviço e barbeiro (RF09)
  const lista = await q(
    `SELECT a.id, a.data_hora, a.status, a.observacao,
            c.nome AS cliente, c.telefone AS cliente_tel,
            s.nome AS servico, s.preco, s.duracao_min,
            b.nome AS barbeiro
       FROM agendamentos a
       JOIN clientes  c ON c.id = a.cliente_id
       JOIN servicos  s ON s.id = a.servico_id
       JOIN barbeiros b ON b.id = s.barbeiro_id
      ORDER BY DATE(a.data_hora) ASC, TIME(a.data_hora) ASC`
  );

  render(req, res, {
    titulo: 'Agendamentos',
    pagina: 'agendamentos',
    corpo: view({ form, erros, clientesLista, servicosLista, lista, csrf: csrfToken(req) }),
  });
}

router.get('/', wrap(async (req, res) => {
  let form = formVazio();
  const id = inteiro(req.query.editar);
  if (id) {
    const [a] = await q(
      "SELECT id, cliente_id, servico_id, data_hora, status, COALESCE(observacao, '') AS observacao FROM agendamentos WHERE id = ?",
      [id]
    );
    if (a) form = { ...a, data_hora: paraInputLocal(a.data_hora) };
  }
  await pagina(req, res, form, []);
}));

router.post('/', csrfValidar, wrap(async (req, res) => {
  const acao = str(req.body.acao);

  if (acao === 'excluir') {
    await q('DELETE FROM agendamentos WHERE id = ?', [inteiro(req.body.id)]);
    setFlash(req, 'ok', 'Agendamento excluído.');
    return res.redirect('/agendamentos');
  }

  if (acao === 'salvar') {
    const form = {
      id: inteiro(req.body.id),
      cliente_id: inteiro(req.body.cliente_id),
      servico_id: inteiro(req.body.servico_id),
      data_hora: str(req.body.data_hora).trim(),
      status: str(req.body.status) || 'Agendado',
      observacao: str(req.body.observacao).trim(),
    };
    if (!STATUS_VALIDOS.includes(form.status)) form.status = 'Agendado';
    const erros = [];

    const [cli] = await q('SELECT COUNT(*) AS n FROM clientes WHERE id = ?', [form.cliente_id]);
    if (!cli.n) erros.push('Escolha o cliente.');

    const [serv] = await q('SELECT barbeiro_id, duracao_min FROM servicos WHERE id = ?', [form.servico_id]);
    if (!serv) erros.push('Escolha o serviço.');

    const dt = lerDataHoraLocal(form.data_hora);
    if (!dt) erros.push('Informe uma data e hora válidas.');
    else if (!form.id && dt < new Date()) erros.push('Não é possível agendar em um horário que já passou.');

    // Evita choque de horário do mesmo barbeiro, considerando a duração do serviço (RF10)
    if (!erros.length && form.status !== 'Cancelado') {
      const ini = paraMysql(dt);
      const fim = paraMysql(new Date(dt.getTime() + Number(serv.duracao_min) * 60000));
      const [choque] = await q(
        `SELECT COUNT(*) AS n FROM agendamentos a JOIN servicos s ON s.id = a.servico_id
          WHERE s.barbeiro_id = ? AND a.status <> 'Cancelado' AND a.id <> ?
            AND a.data_hora < ? AND DATE_ADD(a.data_hora, INTERVAL s.duracao_min MINUTE) > ?`,
        [serv.barbeiro_id, form.id, fim, ini]
      );
      if (choque.n > 0) erros.push('Esse barbeiro já tem atendimento nesse horário. Escolha outro horário.');
    }

    if (!erros.length) {
      const obs = form.observacao === '' ? null : form.observacao;
      const quando = paraMysql(dt);
      if (form.id) {
        await q('UPDATE agendamentos SET cliente_id = ?, servico_id = ?, data_hora = ?, status = ?, observacao = ? WHERE id = ?',
          [form.cliente_id, form.servico_id, quando, form.status, obs, form.id]);
        setFlash(req, 'ok', 'Agendamento atualizado.');
      } else {
        await q('INSERT INTO agendamentos (cliente_id, servico_id, data_hora, status, observacao) VALUES (?, ?, ?, ?, ?)',
          [form.cliente_id, form.servico_id, quando, form.status, obs]);
        setFlash(req, 'ok', 'Horário agendado.');
      }
      return res.redirect('/agendamentos');
    }
    return pagina(req, res, form, erros);
  }

  res.redirect('/agendamentos');
}));

module.exports = router;
