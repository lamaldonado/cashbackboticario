const chai = require('chai');
const sinon = require('sinon');
const fs = require('fs');

const RevendedorPostService = require('../../src/services/revendedor');
const RevendedorDao = require('../../src/database/revendedor/revendedorDao');
const ComprasPostService = require('../../src/services/compras');
const CompraDao = require('../../src/database/compra/compraDao');

const { expect } = chai;

chai.use(require('chai-as-promised'));
chai.use(require('deep-equal-in-any-order'));

describe('Testing service compra post', () => {
  describe('compraService create function', () => {
    describe('validating parameters', () => {
      describe('and the codigo is not passed', () => {
        const comprasService = new ComprasPostService();
        it('should return error', async () => {
          await expect(comprasService.create({
            cpf: '11111111111',
            valor: '12,34',
            data: '01/01/2020'
          })).to.be.rejectedWith(Error, 'Código inválido');
        });
      });
      describe('and the cpf is not passed', () => {
        const comprasService = new ComprasPostService();
        it('should return error', async () => {
          await expect(comprasService.create({
            codigo: '1',
            valor: '12,34',
            data: '01/01/2020'
          })).to.be.rejectedWith(Error, 'CPF inválido - deve conter 11 dígitos sem pontos e traços');
        });
      });
      describe('and the valor is not passed', () => {
        const comprasService = new ComprasPostService();
        it('should return error', async () => {
          await expect(comprasService.create({
            codigo: '1',
            cpf: '11111111111',
            data: '01/01/2020'
          })).to.be.rejectedWith(Error, 'Valor inválido');
        });
      });
      describe('and the data is not passed', () => {
        const comprasService = new ComprasPostService();
        it('should return error', async () => {
          await expect(comprasService.create({
            codigo: '1',
            cpf: '11111111111',
            valor: '12,34'
          })).to.be.rejectedWith(Error, 'Data inválida');
        });
      });
    });
    describe('and the revendedorDao findByCpf returns error', () => {
      const comprasService = new ComprasPostService();
      before('Mock findByCpf function', () => {
        const fake = sinon.fake.throws('Error getting data from table');
        sinon.replace(RevendedorDao.prototype, 'findByCpf', fake);
      });
      it('should return error', async () => {
        await expect(comprasService.create({
          codigo: '1',
          cpf: '11111111111',
          valor: '12,34',
          data: '01/01/2020'
        })).to.be.rejectedWith(Error, 'Error getting data from table');
      });
      after('Restore Mock', () => {
        sinon.restore();
      });
    });
    describe('and the revendedor is not on DB', () => {
      const comprasService = new ComprasPostService();
      it('should return error', async () => {
        await expect(comprasService.create({
          codigo: '1',
          cpf: '11111111111',
          valor: '12,34',
          data: '01/01/2020'
        })).to.be.rejectedWith(Error, 'Revendedor not found');
      });
      after('Remove created db', () => {
        fs.unlinkSync('data.db');
      });
    });
    describe('and compraDao create function returns error', () => {
      const revendedorService = new RevendedorPostService();
      const comprasService = new ComprasPostService();
      before('Create a revendedor', async () => {
        await revendedorService.create({
          nome: 'Revendedor 1',
          cpf: '11111111111',
          email: 'mail@mail.com',
          senha: 'password'
        });
      });
      before('Mock compraDao create function', () => {
        const fake = sinon.fake.throws('Error creating compra');
        sinon.replace(CompraDao.prototype, 'create', fake);
      });
      it('should return error', async () => {
        await expect(comprasService.create({
          codigo: '1',
          cpf: '11111111111',
          valor: '12,34',
          data: '01/01/2020'
        })).to.be.rejectedWith(Error, 'Error creating compra');
      });
      after('Restore Mock', () => {
        sinon.restore();
      });
      after('Remove created db', () => {
        fs.unlinkSync('data.db');
      });
    });
    describe('and the compra is created', () => {
      const revendedorService = new RevendedorPostService();
      const comprasService = new ComprasPostService();
      before('Create a revendedor', async () => {
        await revendedorService.create({
          nome: 'Revendedor 1',
          cpf: '11111111111',
          email: 'mail@mail.com',
          senha: 'password'
        });
      });
      it('should return the created item', async () => {
        let result = await comprasService.create({
          codigo: '1',
          cpf: '11111111111',
          valor: '12,34',
          data: '01/01/2020'
        });
        expect(result).to.be.deep.equalInAnyOrder({
          codigo: '1',
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
    describe('and the compra is created with cpf 15350946056', () => {
      const revendedorService = new RevendedorPostService();
      const comprasService = new ComprasPostService();
      before('Create a revendedor', async () => {
        await revendedorService.create({
          nome: 'Revendedor 1',
          cpf: '15350946056',
          email: 'mail@mail.com',
          senha: 'password'
        });
      });
      it('should return the created item', async () => {
        let result = await comprasService.create({
          codigo: '1',
          cpf: '15350946056',
          valor: '12,34',
          data: '01/01/2020'
        });
        expect(result).to.be.deep.equalInAnyOrder({
          codigo: '1',
          cpf: '15350946056',
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
