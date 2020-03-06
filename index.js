const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');

const winston = require('./config/winston');
const revendedorRoute = require('./src/routes/revendedor');
const loginRoute = require('./src/routes/login');
const authentication = require('./src/routes/authentication');
const compras = require('./src/routes/compras');
const cashback = require('./src/routes/cashback');

const app = express();
const port = process.env.PORT || 9090;

app.use(bodyParser.json());
app.use(morgan('combined', { stream: winston.stream }));

const basePath = '/api';

app.use(cors());
app.use(`${basePath}/revendedor`, revendedorRoute);
app.use(`${basePath}/login`, loginRoute);
app.use(`${basePath}/compras`, authentication, compras);
app.use(`${basePath}/cashback`, authentication, cashback);
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Not Found'
  });
});

const server = app.listen(port, () => {
  winston.info(`Server runnning on port ${port}`);
  app.emit('Server_started');
});

module.exports.app = app;
module.exports.server = server;
