'use strict';
const layout = require('../views/layout');
const { getFlash } = require('./funcoes');

function render(req, res, { titulo, pagina, corpo }) {
  res.send(layout({
    titulo,
    pagina,
    usuario: req.session.usuario_nome,
    flash: getFlash(req),
    corpo,
  }));
}

module.exports = { render };
