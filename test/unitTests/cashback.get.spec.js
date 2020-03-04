const chai = require('chai');
const sinon = require('sinon');
const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');

const { cashback } = require('../../src/services/cashback/get');

const { expect } = chai;

chai.use(require('chai-as-promised'));
chai.use(require('deep-equal-in-any-order'));

describe('Testing cashback get', () => {
  describe('and the axios get return error', () => {
    before('Mock get function', () => {
      const fake = sinon.fake.throws('Error getting from url');
      sinon.replace(axios, 'get', fake);
    });
    it('should return error', async () => {
      await expect(cashback('11111111111')).to.be.rejectedWith(Error, 'Error getting from url');
    });
    after('Restore Mock', () => {
      sinon.restore();
    });
  });
  describe('and the get returns a value', () => {
    const url = 'https://mdaqk8ek5j.execute-api.us-east-1.amazonaws.com/v1/cashback?cpf=11111111111';
    let mockAxios = new MockAdapter(axios);
    before('mock url', () => {
      mockAxios.onGet(url).reply(200, {
        credit: 1328
      });
    });
    it('should return a value', async () => {
      const response = await cashback('11111111111');
      expect(response).be.deep.equalInAnyOrder({
        credit: 1328
      });
    });
    after('Restore sinon', () => {
      mockAxios.restore();
    });
  });
});
