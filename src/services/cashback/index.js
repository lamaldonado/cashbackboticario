const axios = require('axios');

const winston = require('../../../config/winston');

const cashback = async (cpf) => {
  let result;
  const url = 'https://mdaqk8ek5j.execute-api.us-east-1.amazonaws.com/v1/cashback?cpf=';
  try {
    winston.debug(`Retrieving cashback value for CPF: ${cpf}`);
    result = await axios.get(`${url}${cpf}`, {
      'headers': {
        'token': '&#39;ZXPURQOARHiMc6Y0flhRC1LVlZQVFRnm&#39;'
      }
    });
  } catch (err) {
    winston.error(`Error retrieving cashback value: ${err.message}`);
    throw Error(err.message);
  }
  winston.debug('Cashback retrieved');
  winston.debug(JSON.stringify(result.data));
  return result.data;
}

module.exports.cashback = cashback;
