'use strict';
const express = require('express');
const { q } = require('../db');
const cfg = require('../config');
const { str, inteiro, somenteDigitos, validarCpf, setFlash, csrfToken } = require('../lib/funcoes');
const { exigirLogin, csrfValidar, wrap } = require('../lib/auth');
const { render } = require('../lib/render');
const view = require('../views/clientes');

const router = express.Router();
router.use(exigirLogin);

const CHAVE = cfg.CHAVE_CRIPTO;
const formVazio = () => ({ id: 0, nome: '', cpf: '', telefone: '', email: '' });

async function pagina(req, res, form, erros) {
  // Busca: só filtra depois que o usuário confirma (botão "Buscar" / Enter) – RF05
  const busca = str(req.query.q).trim();
  let sql = 'SELECT id, nome, CAST(AES_DECRYPT(cpf, ?) AS CHAR) AS cpf, telefone, email FROM clientes';
  const par = [CHAVE];
  if (busca !== '') {
    const dig = somenteDigitos(busca);
    sql += ' WHERE nome LIKE ? OR email LIKE ?';
    par.push(`%${busca}%`, `%${busca}%`);
    if (dig !== '') {
      sql += ' OR telefone LIKE ? OR CAST(AES_DECRYPT(cpf, ?) AS CHAR) LIKE ?';
      par.push(`%${dig}%`, CHAVE, `%${dig}%`);
    }
  }
  sql += ' ORDER BY nome';
  const clientes = await q(sql, par);

  render(req, res, {
    titulo: 'Clientes',
    pagina: 'clientes',
    corpo: view({ form, erros, clientes, busca, csrf: csrfToken(req) }),
  });
}

router.get('/', wrap(async (req, res) => {
  let form = formVazio();
  const id = inteiro(req.query.editar);
  if (id) {
    const [c] = await q(
      "SELECT id, nome, CAST(AES_DECRYPT(cpf, ?) AS CHAR) AS cpf, telefone, COALESCE(email, '') AS email FROM clientes WHERE id = ?",
      [CHAVE, id]
    );
    if (c) form = c;
  }
  await pagina(req, res, form, []);
}));

router.post('/', csrfValidar, wrap(async (req, res) => {
  const acao = str(req.body.acao);

  if (acao === 'excluir') {
    try {
      await q('DELETE FROM clientes WHERE id = ?', [inteiro(req.body.id)]);
      setFlash(req, 'ok', 'Cliente excluído.');
    } catch (err) {
      if (err.errno !== 1451) throw err; // 1451 = registro referenciado por chave estrangeira
      setFlash(req, 'erro', 'Este cliente tem agendamentos e não pode ser excluído. Remova os agendamentos primeiro.');
    }
    return res.redirect('/clientes');
  }

  if (acao === 'salvar') {
    const form = {
      id: inteiro(req.body.id),
      nome: str(req.body.nome).trim(),
      cpf: somenteDigitos(req.body.cpf),
      telefone: somenteDigitos(req.body.telefone),
      email: str(req.body.email).trim(),
    };
    const erros = [];
    if ([...form.nome].length < 3) erros.push('Informe o nome completo (mínimo 3 letras).');
    if (!validarCpf(form.cpf)) erros.push('CPF inválido.');
    if (![10, 11].includes(form.telefone.length)) erros.push('Telefone inválido. Use DDD + número.');
    if (form.email !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) erros.push('E-mail inválido.');

    if (!erros.length) {
      const [dup] = await q('SELECT COUNT(*) AS n FROM clientes WHERE cpf = AES_ENCRYPT(?, ?) AND id <> ?', [form.cpf, CHAVE, form.id]);
      if (dup.n > 0) erros.push('Já existe um cliente com este CPF.');
    }

    if (!erros.length) {
      const email = form.email === '' ? null : form.email;
      try {
        if (form.id) {
          await q('UPDATE clientes SET nome = ?, cpf = AES_ENCRYPT(?, ?), telefone = ?, email = ? WHERE id = ?',
            [form.nome, form.cpf, CHAVE, form.telefone, email, form.id]);
          setFlash(req, 'ok', 'Cliente atualizado.');
        } else {
          await q('INSERT INTO clientes (nome, cpf, telefone, email) VALUES (?, AES_ENCRYPT(?, ?), ?, ?)',
            [form.nome, form.cpf, CHAVE, form.telefone, email]);
          setFlash(req, 'ok', 'Cliente cadastrado.');
        }
        return res.redirect('/clientes');
      } catch (err) {
        if (err.errno !== 1062) throw err; // 1062 = CPF duplicado (corrida entre duas requisições)
        erros.push('Já existe um cliente com este CPF.');
      }
    }
    return pagina(req, res, form, erros);
  }

  res.redirect('/clientes');
}));

module.exports = router;
