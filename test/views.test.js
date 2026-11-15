'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const layout = require('../views/layout');
const clientesView = require('../views/clientes');
const agendamentosView = require('../views/agendamentos');
const servicosView = require('../views/servicos');
const loginView = require('../views/login');

test('clientes: lista mascara o CPF e escapa nomes', () => {
  const html = clientesView({
    form: { id: 0, nome: '', cpf: '', telefone: '', email: '' },
    erros: [],
    clientes: [{ id: 1, nome: '<b>Ana</b>', cpf: '52998224725', telefone: '47991112233', email: null }],
    busca: '',
    csrf: 'tok',
  });
  assert.match(html, /\*\*\*\.982\.247-\*\*/);
  assert.doesNotMatch(html, /529\.982\.247-25/);
  assert.match(html, /&lt;b&gt;Ana&lt;\/b&gt;/);
  assert.match(html, /name="csrf" value="tok"/);
});

test('clientes: mensagem de busca sem resultados', () => {
  const html = clientesView({ form: { id: 0, nome: '', cpf: '', telefone: '', email: '' }, erros: [], clientes: [], busca: 'zzz', csrf: 't' });
  assert.match(html, /Nenhum cliente encontrado/);
  assert.match(html, /0 resultado\(s\) para “zzz”/);
});

test('agendamentos: selo de situação usa classe sem acento', () => {
  const html = agendamentosView({
    form: { id: 0, cliente_id: 0, servico_id: 0, data_hora: '', status: 'Agendado', observacao: '' },
    erros: [],
    clientesLista: [{ id: 1, nome: 'Carlos' }],
    servicosLista: [{ id: 1, nome: 'Corte', barbeiro: 'André', duracao_min: 40 }],
    lista: [{ id: 1, data_hora: '2026-11-15 09:00:00', status: 'Concluído', cliente: 'Carlos', cliente_tel: '47991112233',
              servico: 'Corte', preco: '50.00', duracao_min: 40, barbeiro: 'André' }],
    csrf: 't',
  });
  assert.match(html, /selo selo-concluido/);
  assert.match(html, /15\/11\/2026/);
  assert.match(html, /R\$ 50,00/);
});

test('serviços: avisa quando não há barbeiros', () => {
  const html = servicosView({ form: { id: 0, nome: '', descricao: '', preco: '', duracao_min: '30', barbeiro_id: 0 },
    erros: [], servicos: [], barbeirosLista: [], csrf: 't' });
  assert.match(html, /Cadastre um barbeiro antes/);
});

test('layout e login renderizam', () => {
  assert.match(layout({ titulo: 'X', pagina: 'clientes', usuario: 'Zé', flash: { tipo: 'ok', msg: 'Feito' }, corpo: '<p>c</p>' }),
    /class="ativo" aria-current="page">Clientes/);
  assert.match(loginView({ erro: 'Erro', aviso: '', email: 'a@b.com' }), /alerta-erro/);
});
