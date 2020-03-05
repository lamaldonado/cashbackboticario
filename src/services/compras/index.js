const joi = require('joi');

const RevendedorDao = require('../../database/revendedor/revendedorDao');
const ComprasDao = require('../../database/compra/compraDao');
const winston = require('../../../config/winston');
const schema = require('../../database/compra/compraSchema');

class ComprasService {
  constructor() {
    this.schema = schema;
    this.revendedorDao = new RevendedorDao();
    this.comprasDao = new ComprasDao();
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

  // Cria a compra no banco
  async create(compra) {
    winston.debug('Entering comprasService.create');
    let compraToStore = compra;
    compraToStore.status = 'Em validação';
    try {
      winston.debug('Validating parameters');
      await this.validateSchema(compraToStore);
    } catch (err) {
      winston.error(`Error validating parameters: ${err.message}`);
      throw Error(err.message);
    }
    let revendedor;
    try {
      winston.debug('Retrieving revendedor');
      revendedor = await this.revendedorDao.findByCpf(compraToStore.cpf);
    } catch (err) {
      winston.error(`Error getting revendedor: ${err.message}`);
      throw Error(err.message);
    }
    if (!revendedor) {
      winston.error('Revendedor not found');
      throw Error('Revendedor not found');
    }
    winston.debug('Revendedor retrieved');
    if (revendedor.cpf === '15350946056') {
      compraToStore.status = 'Aprovado';
    }
    let result;
    try {
      winston.debug('Calling comprasDao.create');
      result = await this.comprasDao.create(compraToStore);
    } catch (err) {
      winston.error(`Error creating compra: ${err.message}`);
      throw Error(err.message);
    }
    winston.debug('Compra created');
    winston.debug(JSON.stringify(result));
    return result;
  }
}

module.exports = ComprasService;
