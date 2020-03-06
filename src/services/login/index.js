const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const RevendedorDao = require('../../database/revendedor/revendedorDao');
const winston = require('../../../config/winston');

class LoginService {
  constructor() {
    this.jwtSecret = process.env.JWTSECRET || 'EurevendedorOBoticárioqueroterbenefíciosdeacordocomomeuvolumedevendas'; // TODO Modificar para variavel de ambiente
  }

  // Compara a senha passada com a senha armazenada
  static async comparePassword(password, hashedPassword) {
    winston.debug('Entering LoginService.comparePassword');
    const result = await new Promise((resolve, reject) => {
      winston.debug('Comparing password');
      bcrypt.compare(password, hashedPassword, (err, compareResult) => {
        if (err) {
          winston.error(`Error comparing password: ${err.message}`);
          reject(err);
        }
        winston.debug(`Password compared: ${compareResult}`);
        resolve(compareResult);
      });
    });
    return result;
  }

  // Efetua o login e retorna um JWT
  async login(revendedor) {
    winston.debug('Entering LoginService.login');
    if (!revendedor.cpf) {
      winston.error('CPF é obrigatório');
      throw Error('CPF é obrigatório');
    }
    if (!revendedor.senha) {
      winston.error('Senha é obrigatório');
      throw Error('Senha é obrigatório');
    }
    const revendedorDao = new RevendedorDao();
    let revendedorFromDatabase;
    try {
      winston.debug('Calling revendedorDao.findByCpf');
      revendedorFromDatabase = await revendedorDao.findByCpf(revendedor.cpf);
      winston.debug('Revendedor fetched from database');
    } catch (err) {
      winston.error(`Error getting revendedor from db: ${err.message}`);
      throw Error(err.message);
    }
    if (revendedorFromDatabase === undefined) {
      return false;
    }
    let compareResult;
    try {
      winston.debug('Comparing password');
      compareResult = await LoginService.comparePassword(
        revendedor.senha,
        revendedorFromDatabase.senha
      );
    } catch (err) {
      winston.error(`Error comparing password: ${err.message}`);
      throw Error(err.message);
    }
    winston.debug(`Password match: ${compareResult}`);
    if (compareResult === false) {
      return false;
    }
    const baseToken = {
      user: {
        cpf: revendedorFromDatabase.cpf,
        email: revendedorFromDatabase.email,
        nome: revendedorFromDatabase.nome
      }
    };
    let token;
    try {
      winston.debug('Creating JWT');
      token = await jwt.sign(baseToken, this.jwtSecret, { expiresIn: '1d' });
    } catch (err) {
      winston.error(`Error creating JWT: ${err.message}`);
      throw Error(err.message);
    }
    return token;
  }
}

module.exports = LoginService;
