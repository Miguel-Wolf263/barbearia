'use strict';
const express = require('express');
const { q } = require('../db');
const { str, inteiro, setFlash, csrfToken } = require('../lib/funcoes');
const { exigirLogin, csrfValidar, wrap } = require('../lib/auth');
const { render } = require('../lib/render');
const view = require('../views/servicos');

const router = express.Router();
router.use(exigirLogin);

const formVazio = () => ({ id: 0, nome: '', descricao: '', preco: '', duracao_min: '30', barbeiro_id: 0 });

async function pagina(req, res, form, erros) {
  const barbeirosLista = await q('SELECT id, nome FROM barbeiros ORDER BY nome');
  const servicos = await q(
    `SELECT s.id, s.nome, s.descricao, s.preco, s.duracao_min, b.nome AS barbeiro
       FROM servicos s JOIN barbeiros b ON b.id = s.barbeiro_id
      ORDER BY s.nome`
  );
  render(req, res, {
    titulo: 'Serviços',
    pagina: 'servicos',
    corpo: view({ form, erros, servicos, barbeirosLista, csrf: csrfToken(req) }),
  });
}

router.get('/', wrap(async (req, res) => {
  let form = formVazio();
  const id = inteiro(req.query.editar);
  if (id) {
    const [s] = await q(
      "SELECT id, nome, COALESCE(descricao, '') AS descricao, preco, duracao_min, barbeiro_id FROM servicos WHERE id = ?",
      [id]
    );
    if (s) {
      form = { ...s, preco: Number(s.preco).toFixed(2).replace('.', ','), duracao_min: String(s.duracao_min) };
    }
  }
  await pagina(req, res, form, []);
}));

router.post('/', csrfValidar, wrap(async (req, res) => {
  const acao = str(req.body.acao);

  if (acao === 'excluir') {
    try {
      await q('DELETE FROM servicos WHERE id = ?', [inteiro(req.body.id)]);
      setFlash(req, 'ok', 'Serviço excluído.');
    } catch (err) {
      if (err.errno !== 1451) throw err;
      setFlash(req, 'erro', 'Este serviço está em agendamentos e não pode ser excluído. Remova os agendamentos primeiro.');
    }
    return res.redirect('/servicos');
  }

  if (acao === 'salvar') {
    const form = {
      id: inteiro(req.body.id),
      nome: str(req.body.nome).trim(),
      descricao: str(req.body.descricao).trim(),
      preco: str(req.body.preco).trim(),
      duracao_min: str(req.body.duracao_min).trim(),
      barbeiro_id: inteiro(req.body.barbeiro_id),
    };
    // "1.250,50" -> "1250.50"
    const preco = form.preco.replace(/\./g, '').replace(',', '.');
    const erros = [];

    if ([...form.nome].length < 3) erros.push('Informe o nome do serviço (mínimo 3 letras).');
    if (!/^\d+(\.\d+)?$/.test(preco) || Number(preco) <= 0 || Number(preco) >= 1000000) erros.push('Informe um preço maior que zero.');
    if (!/^\d+$/.test(form.duracao_min) || Number(form.duracao_min) < 5 || Number(form.duracao_min) > 480) {
      erros.push('A duração deve ficar entre 5 e 480 minutos.');
    }
    if (form.barbeiro_id <= 0) {
      erros.push('Escolha o barbeiro responsável pelo serviço.');
    } else {
      const [ok] = await q('SELECT COUNT(*) AS n FROM barbeiros WHERE id = ?', [form.barbeiro_id]);
      if (!ok.n) erros.push('O barbeiro escolhido não existe.');
    }

    if (!erros.length) {
      const desc = form.descricao === '' ? null : form.descricao;
      const dur = Number(form.duracao_min);
      if (form.id) {
        await q('UPDATE servicos SET nome = ?, descricao = ?, preco = ?, duracao_min = ?, barbeiro_id = ? WHERE id = ?',
          [form.nome, desc, preco, dur, form.barbeiro_id, form.id]);
        setFlash(req, 'ok', 'Serviço atualizado.');
      } else {
        await q('INSERT INTO servicos (nome, descricao, preco, duracao_min, barbeiro_id) VALUES (?, ?, ?, ?, ?)',
          [form.nome, desc, preco, dur, form.barbeiro_id]);
        setFlash(req, 'ok', 'Serviço cadastrado.');
      }
      return res.redirect('/servicos');
    }
    return pagina(req, res, form, erros);
  }

  res.redirect('/servicos');
}));

module.exports = router;
