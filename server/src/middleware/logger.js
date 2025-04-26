const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const rfs = require('rotating-file-stream');

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), '../logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create a rotating write stream
const accessLogStream = rfs.createStream('access.log', {
  interval: '1d', // rotate daily
  path: logsDir
});

// Create an error log stream
const errorLogStream = rfs.createStream('error.log', {
  interval: '1d', // rotate daily
  path: logsDir
});

// Custom token for request body
morgan.token('body', (req) => {
  // Don't log passwords
  const body = { ...req.body };
  if (body.password) body.password = '[FILTERED]';
  
  return JSON.stringify(body);
});

// Access logger
const accessLogger = morgan(
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms',
  {
    stream: accessLogStream,
    skip: (req, res) => res.statusCode >= 400
  }
);

// Error logger
const errorLogger = morgan(
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :body :response-time ms',
  {
    stream: errorLogStream,
    skip: (req, res) => res.statusCode < 400
  }
);

// Development logger
const developmentLogger = morgan('dev');

// Export loggers based on environment
module.exports = {
  accessLogger,
  errorLogger,
  developmentLogger
};
