const chai = require('chai');
const sinon = require('sinon');
const fs = require('fs');

const { SqliteDb } = require('../src/database/sqlitedb');

const { expect } = chai;

chai.use(require('chai-as-promised'));
chai.use(require('deep-equal-in-any-order'));

let sqlitedb = new SqliteDb();

const sql = `CREATE TABLE IF NOT EXISTS
teste (teste text primary key)`;

describe('Testing SqliteDb', () => {
  describe('And the openDb function returns error', () => {
    before('Mock SqliteDb openDb function', () => {
      const fake = sinon.fake.throws('Error opening DB');
      sinon.replace(SqliteDb.prototype, 'openDb', fake);
    });
    it('should return error', async () => {
      await expect(sqlitedb.runSql(sql, [])).to.be.rejectedWith(Error);
    });
    after('Restore Mock', () => {
      sinon.restore();
    });
  });
  describe('And the runDb function returns error', () => {
    before('Mock SqliteDb runDb function', () => {
      const fake = sinon.fake.throws('Error on running query');
      sinon.replace(SqliteDb.prototype, 'runDb', fake);
    });
    it('should return error', async () => {
      await expect(sqlitedb.runSql(sql, [])).to.be.rejectedWith(Error);
    });
    after('Restore Mock', () => {
      sinon.restore();
    });
    after('Remove created db', () => {
      fs.unlinkSync('data.db');
    });
  });
  describe('And the closeDb function returns error', () => {
    before('Mock SqliteDb closeDb function', () => {
      const fake = sinon.fake.throws('Error closing DB');
      sinon.replace(SqliteDb.prototype, 'closeDb', fake);
    });
    it('should return error', async () => {
      await expect(sqlitedb.runSql(sql, [])).to.be.rejectedWith(Error);
    });
    after('Restore Mock', () => {
      sinon.restore();
    });
    after('Remove created db', () => {
      fs.unlinkSync('data.db');
    });
  });
  describe('And the it can run the query', () => {
    it('should return ok', async () => {
      let result = await sqlitedb.runSql(sql, []);
      expect(result).to.be.eq();
    });
    after('Remove created db', () => {
      fs.unlinkSync('data.db');
    });
  });
});
