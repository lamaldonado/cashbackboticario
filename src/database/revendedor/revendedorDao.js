const joi = require('joi');

const schema = require('./revendedorSchema');
const { SqliteDb } = require('../sqlitedb');

class RevendedorDao {
  constructor() {
    this.sqlitedb = new SqliteDb();
    this.schema = schema;
    this.tableCreated = false;
  }

  async createRevendedorTable() {
    const sql = `CREATE TABLE IF NOT EXISTS
revendedor (cpf text primary key,
nome text,
email text,
senha text)`;
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

module.exports = RevendedorDao;
