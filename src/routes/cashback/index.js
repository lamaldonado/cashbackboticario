const express = require('express');

const router = express.Router();

const { cashback } = require('../../services/cashback/get');

router.get('/', async (req, res) => {
  if (!req.query.cpf) {
    res.status(422).json({
      success: false,
      message: 'CPF inválido - deve conter 11 dígitos sem pontos e traços'
    });
    return;
  }
  let result;
  try {
    result = await cashback(req.query.cpf);
  } catch (err) {
    winston.error(`Error creating compra: ${err.message}`);
    res.status(500).json({
      success: false,
      message: 'Invalid Request',
      error: err.message
    });
  }
  res.status(200).json({
    success: true,
    credit: result.body.credit
  });
});

module.exports = router;
