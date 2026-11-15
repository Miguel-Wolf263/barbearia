'use strict';
const express = require('express');
const { q } = require('../db');
const { exigirLogin, wrap } = require('../lib/auth');
const { render } = require('../lib/render');
const painelView = require('../views/painel');

const router = express.Router();
router.use(exigirLogin);

router.get('/', wrap(async (req, res) => {
  const cont = async (sql) => Number((await q(sql))[0].n);

  const total = {
    clientes: await cont('SELECT COUNT(*) AS n FROM clientes'),
    barbeiros: await cont('SELECT COUNT(*) AS n FROM barbeiros'),
    servicos: await cont('SELECT COUNT(*) AS n FROM servicos'),
    agendamentos: await cont("SELECT COUNT(*) AS n FROM agendamentos WHERE status = 'Agendado' AND data_hora >= NOW()"),
  };

  const proximos = await q(
    `SELECT a.data_hora, c.nome AS cliente, s.nome AS servico, b.nome AS barbeiro
       FROM agendamentos a
       JOIN clientes  c ON c.id = a.cliente_id
       JOIN servicos  s ON s.id = a.servico_id
       JOIN barbeiros b ON b.id = s.barbeiro_id
      WHERE a.status = 'Agendado' AND a.data_hora >= NOW()
      ORDER BY a.data_hora ASC LIMIT 5`
  );

  render(req, res, {
    titulo: 'Painel',
    pagina: 'painel',
    corpo: painelView({ nome: req.session.usuario_nome, total, proximos }),
  });
}));

module.exports = router;
