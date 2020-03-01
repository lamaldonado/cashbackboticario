const joi = require('joi');

const schema = require('./compraSchema');
const { SqliteDb } = require('../sqlitedb');

class CompraDao {
  constructor() {
    this.sqlitedb = new SqliteDb();
    this.schema = schema;
    this.tableCreated = false;
  }

  // Cria a tabela
  async createCompraTable() {
    const sql = `CREATE TABLE IF NOT EXISTS
Compra (cpf text primary key,
codigo text,
valor text,
data text,
status text)`;
    try {
      await this.sqlitedb.runSql(sql, []);
    } catch (err) {
      throw new Error(err.message);
    }
    this.tableCreated = true;
    return true;
  }

  // Valida o dado recebido com o schema
  async validateSchema(receivedData) {
    try {
      await joi.validate(receivedData, this.schema, { abortEarly: false });
    } catch (err) {
      throw Error(err.details[0].message);
    }
    return true;
  }

  // Cria o registro
  async create(receivedData) {
    if (this.tableCreated === false) {
      try {
        await this.createCompraTable();
      } catch (err) {
        throw Error(err.message);
      }
    }
    try {
      await this.validateSchema(receivedData);
    } catch (err) {
      throw Error(err.message);
    }
    const sql = 'INSERT INTO compra (codigo, cpf, valor, data, status) values (?, ?, ?, ?, ?)';
    const params = [
      receivedData.codigo,
      receivedData.cpf,
      receivedData.valor,
      receivedData.data,
      receivedData.status
    ];
    try {
      await this.sqlitedb.runSql(sql, params);
    } catch (err) {
      throw Error(err.message);
    }
    return receivedData;
  }
}

module.exports = CompraDao;
