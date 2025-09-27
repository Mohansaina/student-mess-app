const auth = require('./auth');
const errorHandler = require('./errorHandler');
const validation = require('./validation');
const upload = require('./upload');

module.exports = {
  ...auth,
  errorHandler,
  ...validation,
  ...upload
};