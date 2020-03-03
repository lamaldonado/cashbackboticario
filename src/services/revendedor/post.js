const bcrypt = require('bcrypt');

const RevendedorDao = require('../../database/revendedor/revendedorDao');
const winston = require('../../../config/winston');

class RevendedorService {
  constructor() {
    this.saltRounds = 10;
  }

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

  async create(revendedor) {
    winston.debug('Entering revendedorService.create');
    if (!revendedor.senha) {
      winston.error('Senha is required');
      throw Error('Senha is required');
    }
    winston.debug('Creating RevendedorDao');
    const revendedorDao = new RevendedorDao();
    let hashedPassword;
    try {
      winston.debug('Calling revendedorDao.hashPassword');
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
      result = await revendedorDao.create(revendedorToStore);
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
