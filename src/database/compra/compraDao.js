const joi = require('joi');

const schema = require('./compraSchema');
const { SqliteDb } = require('../sqlitedb');

class CompraDao {
  constructor() {
    this.sqlitedb = new SqliteDb();
    this.schema = schema;
    this.tableCreated = false;
  }

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

  async validateSchema(receivedData) {
    try {
      await joi.validate(receivedData, this.schema, { abortEarly: false });
    } catch (err) {
      throw Error(err.details[0].message);
    }
    return true;
  }
}

module.exports = CompraDao;
