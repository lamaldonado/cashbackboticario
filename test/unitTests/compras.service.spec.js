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

describe('Testing service compra get', () => {
  describe('compraService calculateCashBack function', () => {
    describe('and the value is not passed', () => {
      const comprasService = new ComprasPostService();
      it('should return error', async () => {
        await expect(comprasService.calculateCashBack()).to.be.rejectedWith(Error, 'Valor não informado');
      });
    });
    describe('and the value is passed', () => {
      describe('and the value is invalid', () => {
        const comprasService = new ComprasPostService();
        it('should return the created item', async () => {
          await expect(comprasService.calculateCashBack('abc')).to.be.rejectedWith(Error, 'Valor informado é inválido');
        });
      });
      describe('and the value is valid', () => {
        describe('and the value is less than 1000', () => {
          const comprasService = new ComprasPostService();
          it('should return the calculated value', async () => {
            let result = await comprasService.calculateCashBack(123.45);
            expect(result).to.be.deep.equalInAnyOrder({
              valor: '12,35',
              porcentagem: '10'
            });
          });
        });
        describe('and the value is greater than 1000 and less than 1500', () => {
          const comprasService = new ComprasPostService();
          it('should return the calculated value', async () => {
            let result = await comprasService.calculateCashBack(1000.45);
            expect(result).to.be.deep.equalInAnyOrder({
              valor: '150,07',
              porcentagem: '15'
            });
          });
        });
        describe('and the value is greater than 1500', () => {
          const comprasService = new ComprasPostService();
          it('should return the calculated value', async () => {
            let result = await comprasService.calculateCashBack(1500.45);
            expect(result).to.be.deep.equalInAnyOrder({
              valor: '300,09',
              porcentagem: '20'
            });
          });
        });
      });
    });
  });
  describe('compraService get function', () => {
    describe('and the cpf is not passed', () => {
      const comprasService = new ComprasPostService();
      it('should return error', async () => {
        await expect(comprasService.get()).to.be.rejectedWith(Error, 'CPF não informado');
      });
    });
    describe('and the revendedorDao findByCpf returns error', () => {
      const comprasService = new ComprasPostService();
      before('Mock findByCpf function', () => {
        const fake = sinon.fake.throws('Error getting data from table');
        sinon.replace(RevendedorDao.prototype, 'findByCpf', fake);
      });
      it('should return error', async () => {
        await expect(comprasService.get('11111111111')).to.be.rejectedWith(Error, 'Error getting data from table');
      });
      after('Restore Mock', () => {
        sinon.restore();
      });
    });
    describe('and the revendedor is not on DB', () => {
      const comprasService = new ComprasPostService();
      it('should return error', async () => {
        await expect(comprasService.get('11111111111')).to.be.rejectedWith(Error, 'Revendedor não encontrado');
      });
      after('Remove created db', () => {
        fs.unlinkSync('data.db');
      });
    });
    describe('and compraDao findByCpf function returns error', () => {
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
      before('Mock compraDao findByCpf function', () => {
        const fake = sinon.fake.throws('Error getting compras');
        sinon.replace(CompraDao.prototype, 'findByCpf', fake);
      });
      it('should return error', async () => {
        await expect(comprasService.get('11111111111')).to.be.rejectedWith(Error, 'Error getting compras');
      });
      after('Restore Mock', () => {
        sinon.restore();
      });
      after('Remove created db', () => {
        fs.unlinkSync('data.db');
      });
    });
    describe('and there is no compras on DB', () => {
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
      it('should return error', async () => {
        await expect(comprasService.get('11111111111')).to.be.rejectedWith(Error, 'Compras não encontrado');
      });
      after('Remove created db', () => {
        fs.unlinkSync('data.db');
      });
    });
    describe('and there is one compra on DB', () => {
      describe('and value is less than 1000', () => {
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
        before('Create a compra', async () => {
          await comprasService.create({
            codigo: '1',
            cpf: '11111111111',
            valor: '12,34',
            data: '01/01/2020'
          });
        });
        it('should return the calculated value', async () => {
          let result = await comprasService.get('11111111111');
          expect(result).to.be.deep.equalInAnyOrder([
            {
              codigo: '1',
              valor: '12,34',
              data: '01/01/2020',
              status: 'Em validação',
              cashback: {
                percentual: '10',
                valor: '1,23'
              }
            }
          ]);
        });
        after('Remove created db', () => {
          fs.unlinkSync('data.db');
        });
      });
      describe('and the value is greater than 1000 and less than 1500', () => {
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
        before('Create a compra', async () => {
          await comprasService.create({
            codigo: '1',
            cpf: '11111111111',
            valor: '1234,56',
            data: '01/01/2020'
          });
        });
        it('should return the calculated value', async () => {
          let result = await comprasService.get('11111111111');
          expect(result).to.be.deep.equalInAnyOrder([
            {
              codigo: '1',
              valor: '1234,56',
              data: '01/01/2020',
              status: 'Em validação',
              cashback: {
                percentual: '15',
                valor: '185,18'
              }
            }
          ]);
        });
        after('Remove created db', () => {
          fs.unlinkSync('data.db');
        });
      });
      describe('and the value is greater than 1500', () => {
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
        before('Create a compra', async () => {
          await comprasService.create({
            codigo: '1',
            cpf: '11111111111',
            valor: '6543,21',
            data: '01/01/2020'
          });
        });
        it('should return the calculated value', async () => {
          let result = await comprasService.get('11111111111');
          expect(result).to.be.deep.equalInAnyOrder([
            {
              codigo: '1',
              valor: '6543,21',
              data: '01/01/2020',
              status: 'Em validação',
              cashback: {
                percentual: '20',
                valor: '1308,64'
              }
            }
          ]);
        });
        after('Remove created db', () => {
          fs.unlinkSync('data.db');
        });
      });
    });
    describe('and there is more than on compra on DB', () => {
      describe('and value is less than 1000', () => {
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
        before('Create compra items', async () => {
          await comprasService.create({
            codigo: '1',
            cpf: '11111111111',
            valor: '12,34',
            data: '01/01/2020'
          });
          await comprasService.create({
            codigo: '2',
            cpf: '11111111111',
            valor: '43,21',
            data: '02/01/2020'
          });
        });
        it('should return the calculated value', async () => {
          let result = await comprasService.get('11111111111');
          expect(result).to.be.deep.equalInAnyOrder([
            {
              codigo: '1',
              valor: '12,34',
              data: '01/01/2020',
              status: 'Em validação',
              cashback: {
                percentual: '10',
                valor: '1,23'
              }
            },
            {
              codigo: '2',
              valor: '43,21',
              data: '02/01/2020',
              status: 'Em validação',
              cashback: {
                percentual: '10',
                valor: '4,32'
              }
            }
          ]);
        });
        after('Remove created db', () => {
          fs.unlinkSync('data.db');
        });
      });
      describe('and the value is greater than 1000 and less than 1500', () => {
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
        before('Create a compra', async () => {
          await comprasService.create({
            codigo: '1',
            cpf: '11111111111',
            valor: '543,21',
            data: '01/01/2020'
          });
          await comprasService.create({
            codigo: '2',
            cpf: '11111111111',
            valor: '567,89',
            data: '02/01/2020'
          });
        });
        it('should return the calculated value', async () => {
          let result = await comprasService.get('11111111111');
          expect(result).to.be.deep.equalInAnyOrder([
            {
              codigo: '1',
              valor: '543,21',
              data: '01/01/2020',
              status: 'Em validação',
              cashback: {
                percentual: '15',
                valor: '81,48'
              }
            },
            {
              codigo: '2',
              valor: '567,89',
              data: '02/01/2020',
              status: 'Em validação',
              cashback: {
                percentual: '15',
                valor: '85,18'
              }
            }
          ]);
        });
        after('Remove created db', () => {
          fs.unlinkSync('data.db');
        });
      });
      describe('and the value is greater than 1500', () => {
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
        before('Create a compra', async () => {
          await comprasService.create({
            codigo: '1',
            cpf: '11111111111',
            valor: '1234,56',
            data: '01/01/2020'
          });
          await comprasService.create({
            codigo: '2',
            cpf: '11111111111',
            valor: '234,56',
            data: '02/01/2020'
          });
          await comprasService.create({
            codigo: '3',
            cpf: '11111111111',
            valor: '345,67',
            data: '03/01/2020'
          });
        });
        it('should return the calculated value', async () => {
          let result = await comprasService.get('11111111111');
          expect(result).to.be.deep.equalInAnyOrder([
            {
              codigo: '1',
              valor: '1234,56',
              data: '01/01/2020',
              status: 'Em validação',
              cashback: {
                percentual: '20',
                valor: '246,91'
              }
            },
            {
              codigo: '2',
              valor: '234,56',
              data: '02/01/2020',
              status: 'Em validação',
              cashback: {
                percentual: '20',
                valor: '46,91'
              }
            },
            {
              codigo: '3',
              valor: '345,67',
              data: '03/01/2020',
              status: 'Em validação',
              cashback: {
                percentual: '20',
                valor: '69,13'
              }
            }
          ]);
        });
        after('Remove created db', () => {
          fs.unlinkSync('data.db');
        });
      });
    });
  });
});
