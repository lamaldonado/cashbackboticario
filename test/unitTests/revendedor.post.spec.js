const chai = require('chai');
const sinon = require('sinon');
const fs = require('fs');
const bcrypt = require('bcrypt');

const RevendedorPostService = require('../../src/services/revendedor/post');
const RevendedorDao = require('../../src/database/revendedor/revendedorDao');

const { expect } = chai;

chai.use(require('chai-as-promised'));
chai.use(require('deep-equal-in-any-order'));

const revendedorService = new RevendedorPostService();

describe('Testing service revendedor post', () => {
  describe('revendedorService hashPassword function', () => {
    describe('and bcrypt hash function returns error', () => {
      before('Mock hash function', () => {
        const fake = sinon.fake.throws('Error hashing password');
        sinon.replace(bcrypt, 'hash', fake);
      });
      it('should return error', async () => {
        await expect(revendedorService.hashPassword('password')).to.be.rejectedWith(Error, 'Error hashing password');
      });
      after('Restore Mock', () => {
        sinon.restore();
      });
    });
  });
  describe('revendedorService create function', () => {
    describe('and hashPassword function returns error', () => {
      before('Mock hashPassword function', () => {
        const fake = sinon.fake.throws('Error hashing password');
        sinon.replace(RevendedorPostService.prototype, 'hashPassword', fake);
      });
      it('should return error', async () => {
        await expect(revendedorService.create({
          nome: 'Revendedor 1',
          cpf: '11111111111',
          email: 'mail@mail.com',
          senha: 'password'
        })).to.be.rejectedWith(Error, 'Error hashing password');
      });
      after('Restore Mock', () => {
        sinon.restore();
      });
    });
    describe('and the password is not passed', () => {
      it('should return error', async () => {
        await expect(revendedorService.create({
          nome: 'Revendedor 1',
          cpf: '11111111111',
          email: 'mail@mail.com'
        })).to.be.rejectedWith(Error, 'Senha is required');
      });
    });
    describe('and revendedorDao create function returns error', () => {
      before('Mock revendedorDao create function', () => {
        const fake = sinon.fake.throws('Error creating revendedor');
        sinon.replace(RevendedorDao.prototype, 'create', fake);
      });
      it('should return error', async () => {
        await expect(revendedorService.create({
          nome: 'Revendedor 1',
          cpf: '11111111111',
          email: 'mail@mail.com',
          senha: 'password'
        })).to.be.rejectedWith(Error, 'Error creating revendedor');
      });
      after('Restore Mock', () => {
        sinon.restore();
      });
    });
    describe('and the revendedor is created', () => {
      it('should return the created item with password hashed', async () => {
        let result = await revendedorService.create({
          nome: 'Revendedor 1',
          cpf: '11111111111',
          email: 'mail@mail.com',
          senha: 'password'
        });
        expect(result.nome).to.be.eq('Revendedor 1');
        expect(result.cpf).to.be.eq('11111111111');
        expect(result.email).to.be.eq('mail@mail.com');
        expect(result.senha).to.not.be.eq('password');
      });
      after('Remove created db', () => {
        fs.unlinkSync('data.db');
      });
    });
    describe('and the revendedor cpf is already on DB', () => {
      before('create the item on db', async () => {
        await revendedorService.create({
          nome: 'Revendedor 1',
          cpf: '11111111111',
          email: 'mail@mail.com',
          senha: 'password'
        });
      });
      it('should return error', async () => {
        await expect(revendedorService.create({
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
});
