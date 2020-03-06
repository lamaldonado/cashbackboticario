const express = require('express');

const router = express.Router();

const RevendedorService = require('../../services/revendedor');
const winston = require('../../../config/winston');

const revendedorService = new RevendedorService();

router.post('/', async (req, res) => {
  winston.debug('Entering Revendedor POST');
  let result;
  try {
    winston.debug('Calling revendedorService.create');
    result = await revendedorService.create(req.body);
    winston.debug('Revendedor created');
    winston.debug(JSON.stringify(result));
    res.status(201).json({
      success: true,
      message: 'Revendedor created',
      nome: result.nome,
      cpf: result.cpf,
      email: result.email
    });
  } catch (err) {
    winston.error(`Error creating revendedor: ${err.message}`);
    if (err.message === 'Já existe um revendedor cadastrado com este CPF') {
      res.status(409).json({
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
