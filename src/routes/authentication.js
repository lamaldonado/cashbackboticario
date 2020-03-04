const jwt = require('jsonwebtoken');

const winston = require('../../config/winston');

const jwtSecret = process.env.JWTSECRET || 'EurevendedorOBoticárioqueroterbenefíciosdeacordocomomeuvolumedevendas'; // TODO Modificar para variavel de ambiente

const verifyToken = async (req, res, next) => {
  winston.debug('Verifying token');
  let token = req.headers.authorization;
  if (!token) {
    winston.debug('Token not supplied');
    return res.status(401).json({
      success: false,
      message: 'Token de autorização não fornecido'
    });
  }
  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length);
  }

  let decoded;
  try {
    winston.debug('Decoding token');
    decoded = await jwt.verify(token, jwtSecret);
    winston.debug('Token decoded');
    req.decoded = decoded;
    next();
    return res;
  } catch (err) {
    winston.debug(`Invalid token ${err}`);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

module.exports = verifyToken;
