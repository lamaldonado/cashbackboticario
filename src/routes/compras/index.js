const express = require('express');

const router = express.Router();

const ComprasService = require('../../services/compras');
const winston = require('../../../config/winston');

const comprasService = new ComprasService();

router.post('/', async (req, res) => {
  winston.debug('Entering Compras POST');
  if (!req.body.cpf) {
    res.status(422).json({
      success: false,
      message: 'CPF inválido - deve conter 11 dígitos sem pontos e traços'
    });
    return;
  }
  let result;
  try {
    winston.debug('Calling comprasService.create');
    result = await comprasService.create(req.body);
    winston.debug('Compra created');
    winston.debug(JSON.stringify(result));
    res.status(201).json({
      success: true,
      message: 'Compra created',
      codigo: result.codigo,
      cpf: result.cpf,
      valor: result.valor,
      data: result.data,
      status: result.status
    });
  } catch (err) {
    winston.error(`Error creating compra: ${err.message}`);
    if (err.message === 'Revendedor não encontrado') {
      res.status(404).json({
        success: false,
        message: 'Invalid Request',
        error: err.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Invalid Request',
        error: err.message
      });
    }
  }
});

router.get('/', async (req, res) => {
  winston.debug('Entering Compras GET');
  if (!req.query.cpf) {
    res.status(422).json({
      success: false,
      message: 'CPF inválido - deve conter 11 dígitos sem pontos e traços'
    });
    return;
  }
  let result;
  try {
    winston.debug('Calling comprasService.get');
    result = await comprasService.get(req.query.cpf);
    winston.debug('Compras retrieved');
    winston.debug(JSON.stringify(result));
    res.status(200).json({
      success: true,
      message: 'Compras retrieved',
      compras: result
    });
  } catch (err) {
    winston.error(`Error retrieving compra: ${err.message}`);
    if (err.message === 'Revendedor não encontrado' || err.message === 'Compras não encontrado') {
      res.status(404).json({
        success: false,
        message: 'Invalid Request',
        error: err.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Invalid Request',
        error: err.message
      });
    }
  }
});

module.exports = router;
