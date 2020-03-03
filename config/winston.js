const winston = require('winston');

const logger = new winston.createLogger({
  level: 'debug',
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.cli(),
        winston.format.timestamp(),
        winston.format.printf(info => (`${info.timestamp} ${info.level}: ${(info.message ? info.message : '')} ${(info.meta ? JSON.stringify(info.meta) : '')} `))
      )
    })
  ],
  exitOnError: false
});

logger.stream = {
  write: function(message, encoding) {
    logger.info(message);
  }
};

module.exports = logger;
