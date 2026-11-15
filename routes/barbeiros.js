'use strict';
const express = require('express');
const { q } = require('../db');
const cfg = require('../config');
const { str, inteiro, somenteDigitos, validarCpf, setFlash, csrfToken } = require('../lib/funcoes');
const { exigirLogin, csrfValidar, wrap } = require('../lib/auth');
const { render } = require('../lib/render');
const view = require('../views/barbeiros');

const router = express.Router();
router.use(exigirLogin);

const CHAVE = cfg.CHAVE_CRIPTO;
const formVazio = () => ({ id: 0, nome: '', cpf: '', telefone: '', especialidade: '' });

async function pagina(req, res, form, erros) {
  const barbeiros = await q(
    'SELECT id, nome, CAST(AES_DECRYPT(cpf, ?) AS CHAR) AS cpf, telefone, especialidade FROM barbeiros ORDER BY nome',
    [CHAVE]
  );
  render(req, res, {
    titulo: 'Barbeiros',
    pagina: 'barbeiros',
    corpo: view({ form, erros, barbeiros, csrf: csrfToken(req) }),
  });
}

router.get('/', wrap(async (req, res) => {
  let form = formVazio();
  const id = inteiro(req.query.editar);
  if (id) {
    const [b] = await q(
      "SELECT id, nome, CAST(AES_DECRYPT(cpf, ?) AS CHAR) AS cpf, telefone, COALESCE(especialidade, '') AS especialidade FROM barbeiros WHERE id = ?",
      [CHAVE, id]
    );
    if (b) form = b;
  }
  await pagina(req, res, form, []);
}));

router.post('/', csrfValidar, wrap(async (req, res) => {
  const acao = str(req.body.acao);

  if (acao === 'excluir') {
    try {
      await q('DELETE FROM barbeiros WHERE id = ?', [inteiro(req.body.id)]);
      setFlash(req, 'ok', 'Barbeiro excluído.');
    } catch (err) {
      if (err.errno !== 1451) throw err;
      setFlash(req, 'erro', 'Este barbeiro tem serviços vinculados e não pode ser excluído. Remova ou reatribua os serviços primeiro.');
    }
    return res.redirect('/barbeiros');
  }

  if (acao === 'salvar') {
    const form = {
      id: inteiro(req.body.id),
      nome: str(req.body.nome).trim(),
      cpf: somenteDigitos(req.body.cpf),
      telefone: somenteDigitos(req.body.telefone),
      especialidade: str(req.body.especialidade).trim(),
    };
    const erros = [];
    if ([...form.nome].length < 3) erros.push('Informe o nome completo (mínimo 3 letras).');
    if (!validarCpf(form.cpf)) erros.push('CPF inválido.');
    if (![10, 11].includes(form.telefone.length)) erros.push('Telefone inválido. Use DDD + número.');

    if (!erros.length) {
      const [dup] = await q('SELECT COUNT(*) AS n FROM barbeiros WHERE cpf = AES_ENCRYPT(?, ?) AND id <> ?', [form.cpf, CHAVE, form.id]);
      if (dup.n > 0) erros.push('Já existe um barbeiro com este CPF.');
    }

    if (!erros.length) {
      const esp = form.especialidade === '' ? null : form.especialidade;
      try {
        if (form.id) {
          await q('UPDATE barbeiros SET nome = ?, cpf = AES_ENCRYPT(?, ?), telefone = ?, especialidade = ? WHERE id = ?',
            [form.nome, form.cpf, CHAVE, form.telefone, esp, form.id]);
          setFlash(req, 'ok', 'Barbeiro atualizado.');
        } else {
          await q('INSERT INTO barbeiros (nome, cpf, telefone, especialidade) VALUES (?, AES_ENCRYPT(?, ?), ?, ?)',
            [form.nome, form.cpf, CHAVE, form.telefone, esp]);
          setFlash(req, 'ok', 'Barbeiro cadastrado.');
        }
        return res.redirect('/barbeiros');
      } catch (err) {
        if (err.errno !== 1062) throw err;
        erros.push('Já existe um barbeiro com este CPF.');
      }
    }
    return pagina(req, res, form, erros);
  }

  res.redirect('/barbeiros');
}));

module.exports = router;
