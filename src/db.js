// using mongoose to simplify the db usage
const mongoose = require('mongoose');
require('./model');

// connect to the database
mongoose.connect('mongodb://accounts:accounts@127.0.0.1:27017/account-management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

// Get the default connection
const db = mongoose.connection;

// Bind connection to error event (to get notification of connection errors)
db.on('error', (e) => {
  throw e;
});

module.exports = db;
