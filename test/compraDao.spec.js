const chai = require('chai');
const sinon = require('sinon');
const fs = require('fs');

const CompraDao = require('../src/database/compra/CompraDao');
const { SqliteDb } = require('../src/database/sqlitedb');
