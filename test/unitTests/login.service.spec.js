const chai = require('chai');
const sinon = require('sinon');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const LoginPostService = require('../../src/services/login');
const RevendedorDao = require('../../src/database/revendedor/revendedorDao');
const RevendedorPostService = require('../../src/services/revendedor');

const { expect } = chai;

chai.use(require('chai-as-promised'));
chai.use(require('deep-equal-in-any-order'));

describe('Testing service revendedor post', () => {
  describe('loginService comparePassword function', () => {
    describe('and bcrypt hash function returns error', () => {
      const loginService = new LoginPostService();
      before('Mock compare function', () => {
        const fake = sinon.fake.throws('Error comparing password');
        sinon.replace(bcrypt, 'compare', fake);
      });
      it('should return error', async () => {
        await expect(LoginPostService.comparePassword('password', '$2b$10$UX7YQ7tfedVxIDVr.vQC5eraJhWSyUTFODSd13DAhstcNVN.yCowO')).to.be.rejectedWith(Error, 'Error comparing password');
      });
      after('Restore Mock', () => {
        sinon.restore();
      });
    });
    describe('and the password does not match', () => {
      const loginService = new LoginPostService();
      it('should return false', async () => {
        let result = await LoginPostService.comparePassword('password', '$2b$10$UX7YQ7tfedVxIDVr.vQC5eraJhWSyUTFODSd13DAhstcNVN.yCowO');
        expect(result).to.be.eq(false);
      });
    });
    describe('and the password matches', () => {
      const loginService = new LoginPostService();
      it('should return true', async () => {
        let result = await LoginPostService.comparePassword('teste', '$2b$10$UX7YQ7tfedVxIDVr.vQC5eraJhWSyUTFODSd13DAhstcNVN.yCowO');
        expect(result).to.be.eq(true);
      });
    });
  });
  describe('loginService login function', () => {
    describe('and the cpf is not passed', () => {
      const loginService = new LoginPostService();
      it('should return error', async () => {
        await expect(loginService.login({
          senha: 'password'
        })).to.be.rejectedWith(Error, 'CPF é obrigatório');
      });
    });
    describe('and the senha is not passed', () => {
      const loginService = new LoginPostService();
      it('should return error', async () => {
        await expect(loginService.login({
          cpf: '11111111111'
        })).to.be.rejectedWith(Error, 'Senha é obrigatório');
      });
    });
    describe('and RevendedorDao findByCpf function returns error', () => {
      const loginService = new LoginPostService();
      before('Mock findByCpf function', () => {
        const fake = sinon.fake.throws('Error getting from DB');
        sinon.replace(RevendedorDao.prototype, 'findByCpf', fake);
      });
      it('should return error', async () => {
        await expect(loginService.login({
          cpf: '11111111111',
          senha: 'password'
        })).to.be.rejectedWith(Error, 'Error getting from DB');
      });
      after('Restore Mock', () => {
        sinon.restore();
      });
    });
    describe('and there is no revendedor on DB', () => {
      const loginService = new LoginPostService();
      it('should return false', async () => {
        let result = await loginService.login({
          cpf: '11111111111',
          senha: 'password'
        });
        expect(result).to.be.eq(false);
      });
      after('Remove created db', () => {
        fs.unlinkSync('data.db');
      });
    });
    describe('and comparePassword function returns error', () => {
      const loginService = new LoginPostService();
      before('Create an register at the DB', async () => {
        revendedorService = new RevendedorPostService();
        let result = await revendedorService.create({
          nome: 'Revendedor 1',
          cpf: '11111111111',
          email: 'mail@mail.com',
          senha: 'password'
        });
      });
      before('Mock comparePassword function', () => {
        const fake = sinon.fake.throws('Error comparing password');
        sinon.replace(LoginPostService, 'comparePassword', fake);
      });
      it('should return error', async () => {
        await expect(loginService.login({
          cpf: '11111111111',
          senha: 'password'
        })).to.be.rejectedWith(Error, 'Error comparing password');
      });
      after('Restore Mock', () => {
        sinon.restore();
      });
      after('Remove created db', () => {
        fs.unlinkSync('data.db');
      });
    });
    describe('and the password does not match', () => {
      const loginService = new LoginPostService();
      before('Create an register at the DB', async () => {
        revendedorService = new RevendedorPostService();
        let result = await revendedorService.create({
          nome: 'Revendedor 1',
          cpf: '11111111111',
          email: 'mail@mail.com',
          senha: 'password'
        });
      });
      it('should return false', async () => {
        let result = await loginService.login({
          cpf: '11111111111',
          senha: 'teste'
        });
        expect(result).to.be.eq(false);
      });
      after('Remove created db', () => {
        fs.unlinkSync('data.db');
      });
    });
    describe('and the jwt sign returns error', () => {
      const loginService = new LoginPostService();
      before('Create an register at the DB', async () => {
        revendedorService = new RevendedorPostService();
        let result = await revendedorService.create({
          nome: 'Revendedor 1',
          cpf: '11111111111',
          email: 'mail@mail.com',
          senha: 'password'
        });
      });
      before('Mock sign function', () => {
        const fake = sinon.fake.throws('Error creating JWT');
        sinon.replace(jwt, 'sign', fake);
      });
      it('should return error', async () => {
        await expect(loginService.login({
          cpf: '11111111111',
          senha: 'password'
        })).to.be.rejectedWith(Error, 'Error creating JWT');
      });
      after('Restore Mock', () => {
        sinon.restore();
      });
      after('Remove created db', () => {
        fs.unlinkSync('data.db');
      });
    });
    describe('and the the function returns a JWT', () => {
      const loginService = new LoginPostService();
      before('Create an register at the DB', async () => {
        revendedorService = new RevendedorPostService();
        let result = await revendedorService.create({
          nome: 'Revendedor 1',
          cpf: '11111111111',
          email: 'mail@mail.com',
          senha: 'password'
        });
      });
      it('should return a JWT', async () => {
        let result = await loginService.login({
          cpf: '11111111111',
          senha: 'password'
        });
        let decoded = jwt.decode(result);
        expect(decoded.user).to.be.deep.eq({
          nome: 'Revendedor 1',
          cpf: '11111111111',
          email: 'mail@mail.com'
        });
      });
      after('Remove created db', () => {
        fs.unlinkSync('data.db');
      });
    });
  });
});
