'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const f = require('../lib/funcoes');

test('validarCpf: aceita CPFs válidos e rejeita inválidos', () => {
  assert.equal(f.validarCpf('529.982.247-25'), true);
  assert.equal(f.validarCpf('11144477735'), true);
  assert.equal(f.validarCpf('123.456.789-09'), true);
  assert.equal(f.validarCpf('52998224726'), false);   // dígito verificador errado
  assert.equal(f.validarCpf('11111111111'), false);   // todos iguais
  assert.equal(f.validarCpf('123'), false);
  assert.equal(f.validarCpf(''), false);
});

test('mascararCpf e formatarCpf', () => {
  assert.equal(f.mascararCpf('52998224725'), '***.982.247-**');
  assert.equal(f.mascararCpf('abc'), '—');
  assert.equal(f.formatarCpf('52998224725'), '529.982.247-25');
});

test('formatarTelefone', () => {
  assert.equal(f.formatarTelefone('47991112233'), '(47) 99111-2233');
  assert.equal(f.formatarTelefone('4733334444'), '(47) 3333-4444');
});

test('dinheiro', () => {
  assert.equal(f.dinheiro('50.00'), 'R$ 50,00');
  assert.equal(f.dinheiro(1234567.5), 'R$ 1.234.567,50');
});

test('e(): escapa HTML (XSS)', () => {
  assert.equal(f.e('<script>alert("x")</script>'), '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;');
  assert.equal(f.e(null), '');
});

test('datas do MySQL', () => {
  assert.equal(f.dataHoraBr('2026-11-15 09:00:00'), '15/11/2026 às 09:00');
  assert.equal(f.dataBr('2026-11-15 09:00:00'), '15/11/2026');
  assert.equal(f.horaBr('2026-11-15 09:00:00'), '09:00');
  assert.equal(f.paraInputLocal('2026-11-15 09:00:00'), '2026-11-15T09:00');
});

test('lerDataHoraLocal valida datas reais', () => {
  const dt = f.lerDataHoraLocal('2026-11-15T09:30');
  assert.ok(dt);
  assert.equal(f.paraMysql(dt), '2026-11-15 09:30:00');
  assert.equal(f.lerDataHoraLocal('2026-02-30T09:30'), null);
  assert.equal(f.lerDataHoraLocal('2026-11-15 09:30'), null);
  assert.equal(f.lerDataHoraLocal(''), null);
});

test('inteiro/str tratam entradas estranhas', () => {
  assert.equal(f.inteiro('12'), 12);
  assert.equal(f.inteiro('abc'), 0);
  assert.equal(f.inteiro(['1', '2']), 0);
  assert.equal(f.inteiro('-4'), 0);
  assert.equal(f.str({ a: 1 }), '');
});
