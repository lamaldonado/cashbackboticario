const bcrypt = require('bcrypt');
const joi = require('joi');

const RevendedorDao = require('../../database/revendedor/revendedorDao');
const winston = require('../../../config/winston');
const schema = require('../../database/revendedor/revendedorSchema');

class RevendedorService {
  constructor() {
    this.schema = schema;
    this.saltRounds = 10;
    this.revendedorDao = new RevendedorDao();
  }

  // Valida o dado recebido com o schema
  async validateSchema(receivedData) {
    try {
      await joi.validate(receivedData, this.schema, { abortEarly: false });
    } catch (err) {
      winston.error(`Error validating parameters: ${err.details[0].message}`);
      throw Error(err.details[0].message);
    }
    return true;
  }

  // Cria o hash da senha
  async hashPassword(password) {
    winston.debug('Entering revendedorService.hashPassword');
    const hashedPassword = await new Promise((resolve, reject) => {
      winston.debug('Hasing password');
      bcrypt.hash(password, this.saltRounds, (err, hash) => {
        if (err) {
          winston.error(`Error hasing password: ${err.message}`);
          reject(err);
        }
        winston.debug('Password hashed');
        resolve(hash);
      });
    });
    return hashedPassword;
  }

  // Cria o revendedor no banco
  async create(revendedor) {
    winston.debug('Entering revendedorService.create');
    try {
      winston.debug('Validating parameters');
      await this.validateSchema(revendedor);
    } catch (err) {
      throw Error(err.message);
    }
    let hashedPassword;
    try {
      winston.debug('Calling hashPassword');
      hashedPassword = await this.hashPassword(revendedor.senha);
    } catch (err) {
      winston.error(`Error hasing password: ${err.message}`);
      throw Error(err.message);
    }
    const revendedorToStore = revendedor;
    revendedorToStore.senha = hashedPassword;
    let result;
    try {
      winston.debug('Calling revendedorDao.create');
      result = await this.revendedorDao.create(revendedorToStore);
    } catch (err) {
      winston.error(`Error creating revendedor: ${err.message}`);
      throw Error(err.message);
    }
    winston.debug('Revendedor created');
    delete result.senha;
    winston.debug(JSON.stringify(result));
    return result;
  }
}

module.exports = RevendedorService;
