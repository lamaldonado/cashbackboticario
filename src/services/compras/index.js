const joi = require('joi');

const RevendedorDao = require('../../database/revendedor/revendedorDao');
const ComprasDao = require('../../database/compra/compraDao');
const winston = require('../../../config/winston');
const schema = require('../../database/compra/compraSchema');

const formatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

class ComprasService {
  constructor() {
    this.schema = schema;
    this.revendedorDao = new RevendedorDao();
    this.comprasDao = new ComprasDao();
    this.minValue = 1000;
    this.maxValue = 1500;
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
    const compraToStore = compra;
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

  // Calcula o valor de cashback
  async calculateCashBack(value) {
    winston.debug(`Calculating cashback value for total amount: ${value}`);
    if (!value) {
      winston.error('Error validating parameters: Valor não informado');
      throw Error('Valor não informado');
    }
    if (Number.isNaN(Number(value))) {
      winston.error('Error validating parameters: Valor informado é inválido');
      throw Error('Valor informado é inválido');
    }
    let percentage;
    if (value <= this.minValue) {
      percentage = 10;
    } else if (value > this.minValue && value <= this.maxValue) {
      percentage = 15;
    } else {
      percentage = 20;
    }
    const calculatedValue = formatter.format(value * (percentage / 100)).replace('.', ',');
    winston.debug(`Cashback calculated: Percentage: ${percentage} Value: ${calculatedValue}`);
    return {
      porcentagem: percentage.toString(),
      valor: calculatedValue
    };
  }

  // Recupera as compras de um cpf
  async get(cpf) {
    winston.debug('Entering comprasService.get');
    winston.debug('Validating parameters');
    if (!cpf) {
      winston.error('Error validating parameters: CPF não informado');
      throw Error('CPF não informado');
    }
    let revendedor;
    try {
      winston.debug('Retrieving revendedor');
      revendedor = await this.revendedorDao.findByCpf(cpf);
    } catch (err) {
      winston.error(`Error getting revendedor: ${err.message}`);
      throw Error(err.message);
    }
    if (!revendedor) {
      winston.error('Revendedor not found');
      throw Error('Revendedor not found');
    }
    let compras;
    try {
      winston.debug('Retrieving compras');
      compras = await this.comprasDao.findByCpf(cpf);
    } catch (err) {
      winston.error(`Error getting compras: ${err.message}`);
      throw Error(err.message);
    }
    if (compras.length === 0) {
      winston.error('Compras not found');
      throw Error('Compras not found');
    }
    winston.debug('Calculating total amount');
    let totalValue = 0;
    const result = [];
    for (let i = 0; i < compras.length; i += 1) {
      const convertedValue = parseFloat(compras[i].valor.replace(',', '.'));
      const compra = JSON.parse(JSON.stringify(compras[i]));
      delete compra.id;
      delete compra.cpf;
      compra.convertedValue = convertedValue;
      totalValue += convertedValue;
      result.push(compra);
    }
    const calculatedCashback = await this.calculateCashBack(totalValue);
    for (let i = 0; i < result.length; i += 1) {
      const calculatedValue = formatter.format(result[i].convertedValue * (calculatedCashback.porcentagem / 100)).replace(',', '').replace('.', ',');
      winston.debug(`Calculated cashbabk for item ${i + 1}: Percentage: ${calculatedCashback.porcentagem} Value: ${calculatedValue}`);
      result[i].cashback = {
        percentual: calculatedCashback.porcentagem,
        valor: calculatedValue
      };
      delete result[i].convertedValue;
    }
    return result;
  }
}

module.exports = ComprasService;
