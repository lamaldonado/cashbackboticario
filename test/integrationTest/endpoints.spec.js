const chai = require('chai');
const chaiHttp = require('chai-http');
const fs = require('fs');

const { expect } = chai;

chai.use(chaiHttp);
chai.use(require('chai-as-promised'));
chai.use(require('deep-equal-in-any-order'));

const localUrl = 'http://localhost:9090';

describe('Testing endpoints', () => {
  let server;
  let jwt;
  before('Starting server', (done) => {
    const app = require('../../index').app;
    server = require('../../index').server;
    app.on('Server_started', () => {
      done();
    });
  });
  describe('Testing POST /api/revendedor', () => {
    describe('and there is no body', () => {
      it('should return error', async () => {
        let result = await chai.request(localUrl)
        .post('/api/revendedor');
        expect(result.body).to.be.deep.equalInAnyOrder({
          success: false,
          message: 'Invalid Request',
          error: 'Nome inválido'
        });
        expect(result).to.have.status(500);
      });
    });
    describe('and the body is invalid', () => {
      it('should return error', async () => {
        let result = await chai.request(localUrl)
        .post('/api/revendedor')
        .send({
          invalid: 'invalid'
        });
        expect(result.body).to.be.deep.equalInAnyOrder({
          success: false,
          message: 'Invalid Request',
          error: 'Nome inválido'
        });
        expect(result).to.have.status(500);
      });
    });
    describe('and the body does not have cpf', () => {
      it('should return error', async () => {
        let result = await chai.request(localUrl)
        .post('/api/revendedor')
        .send({
          nome: 'Revendedor 1'
        });
        expect(result.body).to.be.deep.equalInAnyOrder({
          success: false,
          message: 'Invalid Request',
          error: 'CPF inválido - deve conter 11 dígitos sem pontos e traços'
        });
        expect(result).to.have.status(500);
      });
    });
    describe('and the body does not have email', () => {
      it('should return error', async () => {
        let result = await chai.request(localUrl)
        .post('/api/revendedor')
        .send({
          nome: 'Revendedor 1',
          cpf: '11111111111'
        });
        expect(result.body).to.be.deep.equalInAnyOrder({
          success: false,
          message: 'Invalid Request',
          error: 'E-mail inválido'
        });
        expect(result).to.have.status(500);
      });
    });
    describe('and the body does not have senha', () => {
      it('should return error', async () => {
        let result = await chai.request(localUrl)
        .post('/api/revendedor')
        .send({
          nome: 'Revendedor 1',
          cpf: '11111111111',
          email: 'mail@mail.com'
        });
        expect(result.body).to.be.deep.equalInAnyOrder({
          success: false,
          message: 'Invalid Request',
          error: 'Senha inválida'
        });
        expect(result).to.have.status(500);
      });
    });
    describe('and the revendedor is created', () => {
      it('should return the item', async () => {
        let result = await chai.request(localUrl)
        .post('/api/revendedor')
        .send({
          nome: 'Revendedor 1',
          cpf: '11111111111',
          email: 'mail@mail.com',
          senha: '1234'
        });
        expect(result.body).to.be.deep.equalInAnyOrder({
          success: true,
          message: 'Revendedor created',
          nome: 'Revendedor 1',
          cpf: '11111111111',
          email: 'mail@mail.com'
        });
        expect(result).to.have.status(201);
      });
    });
    describe('and the revendedor already exists', () => {
      it('should return error', async () => {
        let result = await chai.request(localUrl)
        .post('/api/revendedor')
        .send({
          nome: 'Revendedor 1',
          cpf: '11111111111',
          email: 'mail@mail.com',
          senha: '1234'
        });
        expect(result.body).to.be.deep.equalInAnyOrder({
          success: false,
          message: 'Invalid Request',
          error: 'Já existe um revendedor cadastrado com este CPF'
        });
        expect(result).to.have.status(409);
      });
    });
  });
  describe('Testing POST /api/login', () => {
    describe('and there is no body', () => {
      it('should return error', async () => {
        let result = await chai.request(localUrl)
        .post('/api/login');
        expect(result.body).to.be.deep.equalInAnyOrder({
          success: false,
          message: 'Invalid Request',
          error: 'CPF é obrigatório'
        });
        expect(result).to.have.status(500);
      });
    });
    describe('and the body does not have cpf', () => {
      it('should return error', async () => {
        let result = await chai.request(localUrl)
        .post('/api/login')
        .send({
          invalid: 'invalid'
        });
        expect(result.body).to.be.deep.equalInAnyOrder({
          success: false,
          message: 'Invalid Request',
          error: 'CPF é obrigatório'
        });
        expect(result).to.have.status(500);
      });
    });
    describe('and the body does not have senha', () => {
      it('should return error', async () => {
        let result = await chai.request(localUrl)
        .post('/api/login')
        .send({
          cpf: '11111111111'
        });
        expect(result.body).to.be.deep.equalInAnyOrder({
          success: false,
          message: 'Invalid Request',
          error: 'Senha é obrigatório'
        });
        expect(result).to.have.status(500);
      });
    });
    describe('and the revendedor does not exists', () => {
      it('should return error', async () => {
        let result = await chai.request(localUrl)
        .post('/api/login')
        .send({
          cpf: '22222222222',
          senha: 'password'
        });
        expect(result.body).to.be.deep.equalInAnyOrder({
          success: false,
          message: 'CPF ou senha inválidos'
        });
        expect(result).to.have.status(401);
      });
    });
    describe('and the login is successful', () => {
      it('should return the token', async () => {
        let result = await chai.request(localUrl)
        .post('/api/login')
        .send({
          cpf: '11111111111',
          senha: '1234'
        });
        expect(result.body).to.haveOwnProperty('success');
        expect(result.body.success).to.be.eq(true);
        expect(result.body).to.haveOwnProperty('token');
        expect(result).to.have.status(200);
        jwt = result.body.token;
      });
    });
  });
  describe('Testing POST /api/compras', () => {
    describe('and there is no authorization token', () => {
      it('should return error', async () => {
        let result = await chai.request(localUrl)
        .post('/api/compras');
        expect(result.body).to.be.deep.equalInAnyOrder({
          success: false,
          message: 'Token de autorização não fornecido'
        });
        expect(result).to.have.status(401);
      });
    });
    describe('and there is no body', () => {
      it('should return error', async () => {
        let result = await chai.request(localUrl)
        .post('/api/compras')
        .set('authorization', jwt);
        expect(result.body).to.be.deep.equalInAnyOrder({
          success: false,
          message: 'CPF inválido - deve conter 11 dígitos sem pontos e traços'
        });
        expect(result).to.have.status(422);
      });
    });
    describe('and the body does not have cpf', () => {
      it('should return error', async () => {
        let result = await chai.request(localUrl)
        .post('/api/compras')
        .set('authorization', jwt)
        .send({
          invalid: 'invalid'
        });
        expect(result.body).to.be.deep.equalInAnyOrder({
          success: false,
          message: 'CPF inválido - deve conter 11 dígitos sem pontos e traços'
        });
        expect(result).to.have.status(422);
      });
    });
    describe('and the body does not have codigo', () => {
      it('should return error', async () => {
        let result = await chai.request(localUrl)
        .post('/api/compras')
        .set('authorization', jwt)
        .send({
          cpf: '11111111111'
        });
        expect(result.body).to.be.deep.equalInAnyOrder({
          success: false,
          message: 'Invalid Request',
          error: 'Código inválido'
        });
        expect(result).to.have.status(500);
      });
    });
    describe('and the body does not have valor', () => {
      it('should return error', async () => {
        let result = await chai.request(localUrl)
        .post('/api/compras')
        .set('authorization', jwt)
        .send({
          cpf: '11111111111',
          codigo: '1'
        });
        expect(result.body).to.be.deep.equalInAnyOrder({
          success: false,
          message: 'Invalid Request',
          error: 'Valor inválido'
        });
        expect(result).to.have.status(500);
      });
    });
    describe('and the body does not have data', () => {
      it('should return error', async () => {
        let result = await chai.request(localUrl)
        .post('/api/compras')
        .set('authorization', jwt)
        .send({
          cpf: '11111111111',
          codigo: '1',
          valor: '12,34'
        });
        expect(result.body).to.be.deep.equalInAnyOrder({
          success: false,
          message: 'Invalid Request',
          error: 'Data inválida'
        });
        expect(result).to.have.status(500);
      });
    });
    describe('and the revendedor does not exists', () => {
      it('should return error', async () => {
        let result = await chai.request(localUrl)
        .post('/api/compras')
        .set('authorization', jwt)
        .send({
          cpf: '22222222222',
          codigo: '1',
          valor: '12,34',
          data: '01/01/2020'
        });
        expect(result.body).to.be.deep.equalInAnyOrder({
          success: false,
          message: 'Invalid Request',
          error: 'Revendedor não encontrado'
        });
        expect(result).to.have.status(404);
      });
    });
    describe('and the compra is created', () => {
      it('should return the item', async () => {
        let result = await chai.request(localUrl)
        .post('/api/compras')
        .set('authorization', jwt)
        .send({
          cpf: '11111111111',
          codigo: '1',
          valor: '12,34',
          data: '01/01/2020'
        });
        expect(result.body).to.be.deep.equalInAnyOrder({
          success: true,
          message: 'Compra created',
          codigo: '1',
          cpf: '11111111111',
          valor: '12,34',
          data: '01/01/2020',
          status: 'Em validação'
        });
        expect(result).to.have.status(201);
      });
    });
  });
  describe('Testing GET /api/compras', () => {
    describe('and there is no authorization token', () => {
      it('should return error', async () => {
        let result = await chai.request(localUrl)
        .get('/api/compras');
        expect(result.body).to.be.deep.equalInAnyOrder({
          success: false,
          message: 'Token de autorização não fornecido'
        });
        expect(result).to.have.status(401);
      });
    });
    describe('and there is no query params', () => {
      it('should return error', async () => {
        let result = await chai.request(localUrl)
        .get('/api/compras')
        .set('authorization', jwt);
        expect(result.body).to.be.deep.equalInAnyOrder({
          success: false,
          message: 'CPF inválido - deve conter 11 dígitos sem pontos e traços'
        });
        expect(result).to.have.status(422);
      });
    });
    describe('and the query params does not have cpf', () => {
      it('should return error', async () => {
        let result = await chai.request(localUrl)
        .get('/api/compras')
        .set('authorization', jwt)
        .query({ invalid: 'invalid' });
        expect(result.body).to.be.deep.equalInAnyOrder({
          success: false,
          message: 'CPF inválido - deve conter 11 dígitos sem pontos e traços'
        });
        expect(result).to.have.status(422);
      });
    });
    describe('and the revendedor does not exists', () => {
      it('should return error', async () => {
        let result = await chai.request(localUrl)
        .get('/api/compras')
        .set('authorization', jwt)
        .query({ cpf: '22222222222' });
        expect(result.body).to.be.deep.equalInAnyOrder({
          success: false,
          message: 'Invalid Request',
          error: 'Revendedor não encontrado'
        });
        expect(result).to.have.status(404);
      });
    });
    describe('and there is one compra with value less than 1000', () => {
      it('should return the item', async () => {
        let result = await chai.request(localUrl)
        .get('/api/compras')
        .set('authorization', jwt)
        .query({ cpf: '11111111111' });
        expect(result.body).to.be.deep.equalInAnyOrder({
          success: true,
          message: 'Compras retrieved',
          compras: [
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
          ]
        });
        expect(result).to.have.status(200);
      });
    });
    describe('and there is more than one compra with value greater than 1000 and less than 1500', () => {
      before('Create another compra', async () => {
        await chai.request(localUrl)
        .post('/api/compras')
        .set('authorization', jwt)
        .send({
          cpf: '11111111111',
          codigo: '2',
          valor: '1234,56',
          data: '02/01/2020'
        });
      });
      it('should return the item', async () => {
        let result = await chai.request(localUrl)
        .get('/api/compras')
        .set('authorization', jwt)
        .query({ cpf: '11111111111' });
        expect(result.body).to.be.deep.equalInAnyOrder({
          success: true,
          message: 'Compras retrieved',
          compras: [
            {
              codigo: '1',
              valor: '12,34',
              data: '01/01/2020',
              status: 'Em validação',
              cashback: {
                percentual: '15',
                valor: '1,85'
              }
            },
            {
              codigo: '2',
              valor: '1234,56',
              data: '02/01/2020',
              status: 'Em validação',
              cashback: {
                percentual: '15',
                valor: '185,18'
              }
            }
          ]
        });
        expect(result).to.have.status(200);
      });
    });
    describe('and there is more than one compra with value greater than 1500', () => {
      before('Create another compra', async () => {
        await chai.request(localUrl)
        .post('/api/compras')
        .set('authorization', jwt)
        .send({
          cpf: '11111111111',
          codigo: '3',
          valor: '543,21',
          data: '03/01/2020'
        });
      });
      it('should return the item', async () => {
        let result = await chai.request(localUrl)
        .get('/api/compras')
        .set('authorization', jwt)
        .query({ cpf: 11111111111 });
        expect(result.body).to.be.deep.equalInAnyOrder({
          success: true,
          message: 'Compras retrieved',
          compras: [
            {
              codigo: '1',
              valor: '12,34',
              data: '01/01/2020',
              status: 'Em validação',
              cashback: {
                percentual: '20',
                valor: '2,47'
              }
            },
            {
              codigo: '2',
              valor: '1234,56',
              data: '02/01/2020',
              status: 'Em validação',
              cashback: {
                percentual: '20',
                valor: '246,91'
              }
            },
            {
              codigo: '3',
              valor: '543,21',
              data: '03/01/2020',
              status: 'Em validação',
              cashback: {
                percentual: '20',
                valor: '108,64'
              }
            }
          ]
        });
        expect(result).to.have.status(200);
      });
    });
  });
  describe('Testing GET /api/cashback', () => {
    describe('and there is no authorization token', () => {
      it('should return error', async () => {
        let result = await chai.request(localUrl)
        .get('/api/cashback');
        expect(result.body).to.be.deep.equalInAnyOrder({
          success: false,
          message: 'Token de autorização não fornecido'
        });
        expect(result).to.have.status(401);
      });
    });
    describe('and there is no query params', () => {
      it('should return error', async () => {
        let result = await chai.request(localUrl)
        .get('/api/cashback')
        .set('authorization', jwt);
        expect(result.body).to.be.deep.equalInAnyOrder({
          success: false,
          message: 'CPF inválido - deve conter 11 dígitos sem pontos e traços'
        });
        expect(result).to.have.status(422);
      });
    });
    describe('and the query params does not have cpf', () => {
      it('should return error', async () => {
        let result = await chai.request(localUrl)
        .get('/api/cashback')
        .set('authorization', jwt)
        .query({ invalid: 'invalid' });
        expect(result.body).to.be.deep.equalInAnyOrder({
          success: false,
          message: 'CPF inválido - deve conter 11 dígitos sem pontos e traços'
        });
        expect(result).to.have.status(422);
      });
    });
    describe('and the acumulated cashback value is returned', () => {
      it('should return the value', async () => {
        let result = await chai.request(localUrl)
        .get('/api/cashback')
        .set('authorization', jwt)
        .query({ cpf: 11111111111 });
        expect(result.body).to.be.haveOwnProperty('success');
        expect(result.body.success).to.be.equal(true);
        expect(result.body).to.be.haveOwnProperty('credit');
        expect(result).to.have.status(200);
      });
    });
  });
  after('Close server', async () => {
    await server.close();
  });
  after('Remove created db', () => {
    fs.unlinkSync('data.db');
  });
});

delete require.cache[require.resolve('../../index')];
