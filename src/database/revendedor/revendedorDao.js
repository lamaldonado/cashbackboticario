const joi = require('joi');

const schema = require('./revendedorSchema');
const { SqliteDb } = require('../sqlitedb');

class RevendedorDao {
  constructor() {
    this.sqlitedb = new SqliteDb();
    this.schema = schema;
    this.tableCreated = false;
  }

  // Cria a tabela
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
        await this.createRevendedorTable();
      } catch (err) {
        throw Error(err.message);
      }
    }
    try {
      await this.validateSchema(receivedData);
    } catch (err) {
      throw Error(err.message);
    }
    const sql = 'INSERT INTO revendedor (cpf, nome, email, senha) values (?, ?, ?, ?)';
    const params = [receivedData.cpf, receivedData.nome, receivedData.email, receivedData.senha];
    try {
      await this.sqlitedb.runSql(sql, params);
    } catch (err) {
      if (err.message === 'Error: SQLITE_CONSTRAINT: UNIQUE constraint failed: revendedor.cpf') {
        throw Error('Já existe um revendedor cadastrado com este CPF');
      }
      throw Error(err.message);
    }
    return receivedData;
  }
}

module.exports = RevendedorDao;
