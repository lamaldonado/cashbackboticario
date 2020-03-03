const express = require('express');

const router = express.Router();

const LoginService = require('../../services/login/post');
const winston = require('../../../config/winston');

const loginService = new LoginService();

router.post('/', async (req, res) => {
  winston.debug('Entering Login POST');
  let result;
  try {
    winston.debug('Calling loginService.login');
    result = await loginService.login(req.body);
    if (result === false) {
      winston.debug(`loginService.login response: ${result} - User or password invalid`);
      res.status(401).json({
        success: false,
        message: 'CPF ou senha inválidos'
      });
    } else {
      winston.debug('JWT created');
      res.status(200).json({
        success: true,
        token: `Bearer ${result}`
      });
    }
  } catch (err) {
    winston.error(`Error executing login: ${err.message}`);
    res.status(500).json({
      success: false,
      message: 'Invalid Request',
      error: err.message
    });
  }
});

module.exports = router;
