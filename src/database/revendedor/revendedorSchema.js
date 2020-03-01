const joi = require('joi');

module.exports = joi.object().required().keys({
  nome: joi.string().required().error(() => 'Nome inválido'),
  cpf: joi.string().regex(/^\d{11}$/).required().error(() => 'CPF inválido - deve conter 11 dígitos'),
  email: joi.string().regex(/(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)/).required().error(() => 'E-mail inválido'),
  senha: joi.string().required().error(() => 'Senha inválida'),
});
