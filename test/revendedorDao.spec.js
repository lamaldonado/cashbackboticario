const chai = require('chai');
const sinon = require('sinon');
const fs = require('fs');

const RevendedorDao = require('../src/database/revendedor/revendedorDao');
const { SqliteDb } = require('../src/database/sqlitedb');

const { expect } = chai;

chai.use(require('chai-as-promised'));
chai.use(require('deep-equal-in-any-order'));

describe('Testing RevendedorDao', () => {
  describe('create table function', () => {
    describe('And the createRevendedorTable function returns error', () => {
      let revendedorDao;
      before('Create Dao', () => {
        revendedorDao = new RevendedorDao();
      });
      before('Mock SqliteDb openDb functon', () => {
        const fake = sinon.fake.throws('Error opening DB');
        sinon.replace(SqliteDb.prototype, 'openDb', fake);
      });
      it('should return error', async () => {
        expect(revendedorDao.createRevendedorTable()).to.be.rejectedWith(Error);
      });
      after('Restore Mock', () => {
        sinon.restore();
      });
    });
    describe('And the create table function returns true', () => {
      let revendedorDao;
      before('Create Dao', () => {
        revendedorDao = new RevendedorDao();
      });
      it('should return true', async () => {
        let result = await revendedorDao.createRevendedorTable();
        expect(result).to.be.eq(true);
      });
      after('Remove created db', () => {
        fs.unlinkSync('data.db');
      });
    });
  });
  describe('validateSchema function', () => {
    describe('And the input is empty', () => {
      let revendedorDao;
      before('Create Dao', () => {
        revendedorDao = new RevendedorDao();
      });
      it('should return error', async () => {
        expect(revendedorDao.validateSchema({})).to.be.rejectedWith(Error, 'Nome inválido');
      });
    });
    describe('And the name is a number', () => {
      let revendedorDao;
      before('Create Dao', () => {
        revendedorDao = new RevendedorDao();
      });
      it('should return error', async () => {
        expect(revendedorDao.validateSchema({
          nome: 1
        })).to.be.rejectedWith(Error, 'Nome inválido');
      });
    });
    describe('And the cpf is not present', () => {
      let revendedorDao;
      before('Create Dao', () => {
        revendedorDao = new RevendedorDao();
      });
      it('should return error', async () => {
        expect(revendedorDao.validateSchema({
          nome: 'name'
        })).to.be.rejectedWith(Error, 'CPF inválido - deve conter 11 dígitos');
      });
    });
    describe('And the cpf is invalid', () => {
      let revendedorDao;
      before('Create Dao', () => {
        revendedorDao = new RevendedorDao();
      });
      it('should return error', async () => {
        expect(revendedorDao.validateSchema({
          nome: 'name',
          cpf: '0123'
        })).to.be.rejectedWith(Error, 'CPF inválido - deve conter 11 dígitos');
      });
    });
    describe('And the email is not present', () => {
      let revendedorDao;
      before('Create Dao', () => {
        revendedorDao = new RevendedorDao();
      });
      it('should return error', async () => {
        expect(revendedorDao.validateSchema({
          nome: 'name',
          cpf: '11111111111'
        })).to.be.rejectedWith(Error, 'E-mail inválido');
      });
    });
    describe('And the email is invalid', () => {
      let revendedorDao;
      before('Create Dao', () => {
        revendedorDao = new RevendedorDao();
      });
      it('should return error', async () => {
        expect(revendedorDao.validateSchema({
          nome: 'name',
          cpf: '11111111111',
          email: 'mail@'
        })).to.be.rejectedWith(Error, 'E-mail inválido');
      });
    });
    describe('And the password is not present', () => {
      let revendedorDao;
      before('Create Dao', () => {
        revendedorDao = new RevendedorDao();
      });
      it('should return error', async () => {
        expect(revendedorDao.validateSchema({
          nome: 'name',
          cpf: '11111111111',
          email: 'mail@mail.com'
        })).to.be.rejectedWith(Error, 'Senha inválida');
      });
    });
    describe('And the input is ok', () => {
      let revendedorDao;
      before('Create Dao', () => {
        revendedorDao = new RevendedorDao();
      });
      it('should return true', async () => {
        let result = await revendedorDao.validateSchema({
          nome: 'name',
          cpf: '11111111111',
          email: 'mail@mail.com',
          senha: '1234'
        });
        expect(result).to.be.eq(true);
      });
    });
  });
  describe('create register function', () => {
    describe('And the createRevendedorTable function returns error', () => {
      let revendedorDao;
      before('Create Dao', () => {
        revendedorDao = new RevendedorDao();
      });
      before('Mock createRevendedorTable functon', () => {
        const fake = sinon.fake.throws('Error creating table');
        sinon.replace(revendedorDao, 'createRevendedorTable', fake);
      });
      it('should return error', async () => {
        expect(revendedorDao.create()).to.be.rejectedWith(Error, 'Error creating table');
      });
      after('Restore Mock', () => {
        sinon.restore();
      });
    });
    describe('And the validateSchema function returns error', () => {
      let revendedorDao;
      before('Create Dao', () => {
        revendedorDao = new RevendedorDao();
      });
      it('should return error', async () => {
        await expect(revendedorDao.create({})).to.be.rejectedWith(Error, 'Nome inválido');
      });
      after('Remove created db', () => {
        fs.unlinkSync('data.db');
      });
    });
    describe('And the create function goes ok', () => {
      let revendedorDao;
      before('Create Dao', () => {
        revendedorDao = new RevendedorDao();
      });
      it('should return the created item', async () => {
        let result = await revendedorDao.create({
          nome: 'Revendedor 1',
          cpf: '11111111111',
          email: 'mail@mail.com',
          senha: 'password'
        });
        expect(result).to.be.deep.equalInAnyOrder({
          nome: 'Revendedor 1',
          cpf: '11111111111',
          email: 'mail@mail.com',
          senha: 'password'
        });
      });
      after('Remove created db', () => {
        fs.unlinkSync('data.db');
      });
    });
    describe('And the item is already at the db', () => {
      let revendedorDao;
      before('Create Dao', () => {
        revendedorDao = new RevendedorDao();
      });
      it('should return error', async () => {
        let result = await revendedorDao.create({
          nome: 'Revendedor 1',
          cpf: '11111111111',
          email: 'mail@mail.com',
          senha: 'password'
        });
        expect(result).to.be.deep.equalInAnyOrder({
          nome: 'Revendedor 1',
          cpf: '11111111111',
          email: 'mail@mail.com',
          senha: 'password'
        });
        await expect(revendedorDao.create({
          nome: 'Revendedor 1',
          cpf: '11111111111',
          email: 'mail@mail.com',
          senha: 'password'
        })).to.be.rejectedWith(Error, 'Já existe um revendedor cadastrado com este CPF');
      });
      after('Remove created db', () => {
        fs.unlinkSync('data.db');
      });
    });
  });
  describe('find by cpf function', () => {
    describe('And the createRevendedorTable function returns error', () => {
      let revendedorDao;
      before('Create Dao', () => {
        revendedorDao = new RevendedorDao();
      });
      before('Mock createRevendedorTable functon', () => {
        const fake = sinon.fake.throws('Error creating table');
        sinon.replace(revendedorDao, 'createRevendedorTable', fake);
      });
      it('should return error', async () => {
        await expect(revendedorDao.findByCpf()).to.be.rejectedWith(Error, 'Error creating table');
      });
      after('Restore Mock', () => {
        sinon.restore();
      });
    });
    describe('And the getData function returns error', () => {
      let revendedorDao;
      before('Create Dao', () => {
        revendedorDao = new RevendedorDao();
      });
      before('Mock getData functon', () => {
        const fake = sinon.fake.throws('Error getting data from table');
        sinon.replace(SqliteDb.prototype, 'getData', fake);
      });
      it('should return error', async () => {
        await expect(revendedorDao.findByCpf('123')).to.be.rejectedWith(Error, 'Error getting data from table');
      });
      after('Restore Mock', () => {
        sinon.restore();
      });
      after('Remove created db', () => {
        fs.unlinkSync('data.db');
      });
    });
    describe('And there is no item on db', () => {
      let revendedorDao;
      before('Create Dao', () => {
        revendedorDao = new RevendedorDao();
      });
      it('should return undefined', async () => {
        let result = await revendedorDao.findByCpf('123');
        expect(result).to.be.eq(undefined);
      });
      after('Remove created db', () => {
        fs.unlinkSync('data.db');
      });
    });
    describe('And there is one item on db', () => {
      let revendedorDao;
      before('Create Dao', () => {
        revendedorDao = new RevendedorDao();
      });
      before('Create an register on db', async () => {
        await revendedorDao.create({
          nome: 'Revendedor 1',
          cpf: '11111111111',
          email: 'mail@mail.com',
          senha: 'password'
        });
      });
      it('should return one item', async () => {
        let result = await revendedorDao.findByCpf('11111111111');
        expect(result).to.be.deep.equalInAnyOrder({
          nome: 'Revendedor 1',
          cpf: '11111111111',
          email: 'mail@mail.com',
          senha: 'password'
        });
      });
      after('Remove created db', () => {
        fs.unlinkSync('data.db');
      });
    });
  });
});
