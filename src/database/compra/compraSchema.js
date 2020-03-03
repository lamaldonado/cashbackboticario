const joi = require('joi');

module.exports = joi.object().required().keys({
  codigo: joi.string().required().error(() => 'Código inválido'),
  cpf: joi.string().regex(/^\d{11}$/).required().error(() => 'CPF inválido - deve conter 11 dígitos sem pontos e traços'),
  valor: joi.string().required().error(() => 'Valor inválido'),
  data: joi.string().required().error(() => 'Data inválida'),
  status: joi.string().valid(['Em validação', 'Aprovado']).required().error(() => 'Status inválido')
});
