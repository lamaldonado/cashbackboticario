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
const sqlInsert = 'INSERT INTO teste (teste) values ("teste")';
const sqlInsert2 = 'INSERT INTO teste (teste) values ("teste2")';
const sqlSelect = 'SELECT * FROM teste';

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
  describe('And I want to get data from db', () => {
    describe('And the openDb function returns error', () => {
      before('Mock SqliteDb openDb function', () => {
        const fake = sinon.fake.throws('Error opening DB');
        sinon.replace(SqliteDb.prototype, 'openDb', fake);
      });
      it('should return error', async () => {
        await expect(sqlitedb.getData(sqlSelect, [])).to.be.rejectedWith(Error, 'Error opening DB');
      });
      after('Restore Mock', () => {
        sinon.restore();
      });
    });
    describe('And the getDb function returns error', () => {
      before('Mock SqliteDb getDb function', () => {
        const fake = sinon.fake.throws('Error querying DB');
        sinon.replace(SqliteDb.prototype, 'getDb', fake);
      });
      before('Create table and insert a test value', async () => {
        await sqlitedb.runSql(sql, []);
        await sqlitedb.runSql(sqlInsert, []);
      });
      it('should return error', async () => {
        await expect(sqlitedb.getData(sqlSelect, [])).to.be.rejectedWith(Error, 'Error querying DB');
      });
      after('Restore Mock', () => {
        sinon.restore();
      });
      after('Remove created db', () => {
        fs.unlinkSync('data.db');
      });
    });
    describe('And the closeDb function returns error', () => {
      before('Create table and insert a test value', async () => {
        await sqlitedb.runSql(sql, []);
        await sqlitedb.runSql(sqlInsert, []);
      });
      before('Mock SqliteDb closeDb function', () => {
        const fake = sinon.fake.throws('Error closing DB');
        sinon.replace(SqliteDb.prototype, 'closeDb', fake);
      });
      it('should return error', async () => {
        await expect(sqlitedb.getData(sqlSelect, [])).to.be.rejectedWith(Error, 'Error closing DB');
      });
      after('Restore Mock', () => {
        sinon.restore();
      });
      after('Remove created db', () => {
        fs.unlinkSync('data.db');
      });
    });
    describe('And the it can run the query', () => {
      before('Create table and insert a test value', async () => {
        await sqlitedb.runSql(sql, []);
        await sqlitedb.runSql(sqlInsert, []);
      });
      it('should return the inserted item', async () => {
        let result = await sqlitedb.getData(sqlSelect, []);
        expect(result).to.be.deep.equalInAnyOrder({
          teste: 'teste'
        });
      });
      after('Remove created db', () => {
        fs.unlinkSync('data.db');
      });
    });
  });

  describe('And I want to get all data from db', () => {
    describe('And the openDb function returns error', () => {
      before('Mock SqliteDb openDb function', () => {
        const fake = sinon.fake.throws('Error opening DB');
        sinon.replace(SqliteDb.prototype, 'openDb', fake);
      });
      it('should return error', async () => {
        await expect(sqlitedb.getAllData(sqlSelect, [])).to.be.rejectedWith(Error, 'Error opening DB');
      });
      after('Restore Mock', () => {
        sinon.restore();
      });
    });
    describe('And the runAll function returns error', () => {
      before('Mock SqliteDb runAll function', () => {
        const fake = sinon.fake.throws('Error querying DB');
        sinon.replace(SqliteDb.prototype, 'runAll', fake);
      });
      before('Create table and insert a test value', async () => {
        await sqlitedb.runSql(sql, []);
        await sqlitedb.runSql(sqlInsert, []);
      });
      it('should return error', async () => {
        await expect(sqlitedb.getAllData(sqlSelect, [])).to.be.rejectedWith(Error, 'Error querying DB');
      });
      after('Restore Mock', () => {
        sinon.restore();
      });
      after('Remove created db', () => {
        fs.unlinkSync('data.db');
      });
    });
    describe('And the closeDb function returns error', () => {
      before('Create table and insert a test value', async () => {
        await sqlitedb.runSql(sql, []);
        await sqlitedb.runSql(sqlInsert, []);
      });
      before('Mock SqliteDb closeDb function', () => {
        const fake = sinon.fake.throws('Error closing DB');
        sinon.replace(SqliteDb.prototype, 'closeDb', fake);
      });
      it('should return error', async () => {
        await expect(sqlitedb.getAllData(sqlSelect, [])).to.be.rejectedWith(Error, 'Error closing DB');
      });
      after('Restore Mock', () => {
        sinon.restore();
      });
      after('Remove created db', () => {
        fs.unlinkSync('data.db');
      });
    });
    describe('And the it can run the query', () => {
      before('Create table and insert a test value', async () => {
        await sqlitedb.runSql(sql, []);
        await sqlitedb.runSql(sqlInsert, []);
        await sqlitedb.runSql(sqlInsert2, []);
      });
      it('should return the inserted item', async () => {
        let result = await sqlitedb.getAllData(sqlSelect, []);
        expect(result).to.be.deep.equalInAnyOrder([{
          teste: 'teste'
        },
        {
          teste: 'teste2'
        }]);
      });
      after('Remove created db', () => {
        fs.unlinkSync('data.db');
      });
    });
  });
});
