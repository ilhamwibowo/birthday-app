const winston = require('winston');
const path = require('path');

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(colors);

const environment = process.env.NODE_ENV || 'development';

// log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.combine(
    winston.format.json(),
    winston.format.colorize({ all: true }),
    winston.format.printf(
      (info) => `${info.timestamp} ${info.level}: ${info.message}${info.stack ? '\n' + info.stack : ''}`
    )
  )
);

// logs
const transports = [
  // console
  new winston.transports.Console(),
  // Error logs
  new winston.transports.File({
    filename: path.join('logs', 'error.log'),
    level: 'error',
  }),
  new winston.transports.File({ filename: path.join('logs', 'combined.log') }),
];

// Create and export the logger
const logger = winston.createLogger({
  level: environment === 'production' ? 'info' : 'debug',
  levels,
  format,
  transports,
  exitOnError: false,
});

module.exports = logger;