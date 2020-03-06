const chai = require('chai');
const sinon = require('sinon');
const axios = require('axios');

const { cashback } = require('../../src/services/cashback');

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
      await expect(cashback(11111111111)).to.be.rejectedWith(Error, 'Error getting from url');
    });
    after('Restore Mock', () => {
      sinon.restore();
    });
  });
  describe('and the get returns a value', () => {
    it('should return a value', async () => {
      const response = await cashback(11111111111);
      expect(response).to.be.haveOwnProperty('body');
      expect(response).to.be.haveOwnProperty('statusCode');
      expect(response.body).to.be.haveOwnProperty('credit');
      expect(response.statusCode).to.be.equal(200);
    });
  });
});
