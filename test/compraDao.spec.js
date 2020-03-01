const chai = require('chai');
const sinon = require('sinon');
const fs = require('fs');

const CompraDao = require('../src/database/compra/CompraDao');
const { SqliteDb } = require('../src/database/sqlitedb');

const { expect } = chai;

chai.use(require('chai-as-promised'));
chai.use(require('deep-equal-in-any-order'));

describe('Testing CompraDao', () => {
  describe('create table function', () => {
    describe('And the createRevendedorTable function returns error', () => {
      let compraDao;
      before('Create Dao', () => {
        compraDao = new CompraDao();
      });
      before('Mock SqliteDb openDb functon', () => {
        const fake = sinon.fake.throws('Error opening DB');
        sinon.replace(SqliteDb.prototype, 'openDb', fake);
      });
      it('should return error', async () => {
        expect(compraDao.createCompraTable()).to.be.rejectedWith(Error);
      });
      after('Restore Mock', () => {
        sinon.restore();
      });
    });
    describe('And the create table function returns true', () => {
      let compraDao;
      before('Create Dao', () => {
        compraDao = new CompraDao();
      });
      it('should return true', async () => {
        let result = await compraDao.createCompraTable();
        expect(result).to.be.eq(true);
      });
      after('Remove created db', () => {
        fs.unlinkSync('data.db');
      });
    });
  });
  describe('validateSchema function', () => {
    describe('And the input is empty', () => {
      let compraDao;
      before('Create Dao', () => {
        compraDao = new CompraDao();
      });
      it('should return error', async () => {
        expect(compraDao.validateSchema({})).to.be.rejectedWith(Error, 'Código inválido');
      });
    });
    describe('And the codigo is a number', () => {
      let compraDao;
      before('Create Dao', () => {
        compraDao = new CompraDao();
      });
      it('should return error', async () => {
        expect(compraDao.validateSchema({
          codigo: 1
        })).to.be.rejectedWith(Error, 'Código inválido');
      });
    });
    describe('And the cpf is not present', () => {
      let compraDao;
      before('Create Dao', () => {
        compraDao = new CompraDao();
      });
      it('should return error', async () => {
        expect(compraDao.validateSchema({
          codigo: '1'
        })).to.be.rejectedWith(Error, 'CPF inválido - deve conter 11 dígitos');
      });
    });
    describe('And the cpf is invalid', () => {
      let compraDao;
      before('Create Dao', () => {
        compraDao = new CompraDao();
      });
      it('should return error', async () => {
        expect(compraDao.validateSchema({
          codigo: '1',
          cpf: '0123'
        })).to.be.rejectedWith(Error, 'CPF inválido - deve conter 11 dígitos');
      });
    });
    describe('And the valor is not present', () => {
      let compraDao;
      before('Create Dao', () => {
        compraDao = new CompraDao();
      });
      it('should return error', async () => {
        expect(compraDao.validateSchema({
          codigo: '1',
          cpf: '11111111111'
        })).to.be.rejectedWith(Error, 'Valor inválido');
      });
    });
    describe('And the valor is invalid', () => {
      let compraDao;
      before('Create Dao', () => {
        compraDao = new CompraDao();
      });
      it('should return error', async () => {
        expect(compraDao.validateSchema({
          codigo: '1',
          cpf: '11111111111',
          valor: 1
        })).to.be.rejectedWith(Error, 'Valor inválido');
      });
    });
    describe('And the data is not present', () => {
      let compraDao;
      before('Create Dao', () => {
        compraDao = new CompraDao();
      });
      it('should return error', async () => {
        expect(compraDao.validateSchema({
          codigo: '1',
          cpf: '11111111111',
          valor: '12,34'
        })).to.be.rejectedWith(Error, 'Data inválida');
      });
    });
    describe('And the data is invalid', () => {
      let compraDao;
      before('Create Dao', () => {
        compraDao = new CompraDao();
      });
      it('should return error', async () => {
        expect(compraDao.validateSchema({
          codigo: '1',
          cpf: '11111111111',
          valor: '12,34',
          data: 123
        })).to.be.rejectedWith(Error, 'Data inválida');
      });
    });
    describe('And the status is not present', () => {
      let compraDao;
      before('Create Dao', () => {
        compraDao = new CompraDao();
      });
      it('should return error', async () => {
        expect(compraDao.validateSchema({
          codigo: '1',
          cpf: '11111111111',
          valor: '12,34',
          data: '01/01/2020'
        })).to.be.rejectedWith(Error, 'Status inválido');
      });
    });
    describe('And the status is invalid', () => {
      let compraDao;
      before('Create Dao', () => {
        compraDao = new CompraDao();
      });
      it('should return error', async () => {
        expect(compraDao.validateSchema({
          codigo: '1',
          cpf: '11111111111',
          valor: '12,34',
          data: '01/01/2020',
          status: 'invalid'
        })).to.be.rejectedWith(Error, 'Status inválido');
      });
    });
    describe('And the input is ok with status "Em validação"', () => {
      let compraDao;
      before('Create Dao', () => {
        compraDao = new CompraDao();
      });
      it('should return true', async () => {
        let result = await compraDao.validateSchema({
          codigo: '1',
          cpf: '11111111111',
          valor: '12,34',
          data: '01/01/2020',
          status: 'Em validação'
        });
        expect(result).to.be.eq(true);
      });
    });
    describe('And the input is ok with status "Aprovado"', () => {
      let compraDao;
      before('Create Dao', () => {
        compraDao = new CompraDao();
      });
      it('should return true', async () => {
        let result = await compraDao.validateSchema({
          codigo: '1',
          cpf: '11111111111',
          valor: '12,34',
          data: '01/01/2020',
          status: 'Aprovado'
        });
        expect(result).to.be.eq(true);
      });
    });
  });
  describe('create register function', () => {
    describe('And the createCompraTable function returns error', () => {
      let compraDao;
      before('Create Dao', () => {
        compraDao = new CompraDao();
      });
      before('Mock createCompraTable functon', () => {
        const fake = sinon.fake.throws('Error creating table');
        sinon.replace(compraDao, 'createCompraTable', fake);
      });
      it('should return error', async () => {
        expect(compraDao.create()).to.be.rejectedWith(Error, 'Error creating table');
      });
      after('Restore Mock', () => {
        sinon.restore();
      });
    });
    describe('And the validateSchema function returns error', () => {
      let compraDao;
      before('Create Dao', () => {
        compraDao = new CompraDao();
      });
      it('should return error', async () => {
        await expect(compraDao.create({})).to.be.rejectedWith(Error, 'Código inválido');
      });
      after('Remove created db', () => {
        fs.unlinkSync('data.db');
      });
    });
    describe('And the create function goes ok with status "Em validação"', () => {
      let compraDao;
      before('Create Dao', () => {
        compraDao = new CompraDao();
      });
      it('should return the created item', async () => {
        let result = await compraDao.create({
          codigo: '123',
          cpf: '11111111111',
          valor: '12,34',
          data: '01/01/2020',
          status: 'Em validação'
        });
        expect(result).to.be.deep.equalInAnyOrder({
          codigo: '123',
          cpf: '11111111111',
          valor: '12,34',
          data: '01/01/2020',
          status: 'Em validação'
        });
      });
      after('Remove created db', () => {
        fs.unlinkSync('data.db');
      });
    });
    describe('And the create function goes ok with status "Aprovado"', () => {
      let compraDao;
      before('Create Dao', () => {
        compraDao = new CompraDao();
      });
      it('should return the created item', async () => {
        let result = await compraDao.create({
          codigo: '123',
          cpf: '11111111111',
          valor: '12,34',
          data: '01/01/2020',
          status: 'Aprovado'
        });
        expect(result).to.be.deep.equalInAnyOrder({
          codigo: '123',
          cpf: '11111111111',
          valor: '12,34',
          data: '01/01/2020',
          status: 'Aprovado'
        });
      });
      after('Remove created db', () => {
        fs.unlinkSync('data.db');
      });
    });
  });
});
