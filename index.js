const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');

const winston = require('./config/winston');
const revendedorRoute = require('./src/routes/revendedor');

const app = express();
const port = process.env.PORT || 9090;

app.use(bodyParser.json());
app.use(morgan('combined', { stream: winston.stream }));

const basePath = '/api';

app.use(cors());
app.use(`${basePath}/revendedor`, revendedorRoute);
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Not Found'
  });
});

app.listen(port, () => winston.info(`Server runnning on port ${port}`));
