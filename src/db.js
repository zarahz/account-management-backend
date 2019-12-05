// docker + mongoDB: run mongoDB without further installations
// 1. start docker with mongo instance
// docker run --name some-mongo -p 27017:27017 -v mongo:/data/db -d mongo

// defining the mongoDB schema

// using mongoose to simplify the db usage
const mongoose = require('mongoose');
require('./models');

// connect to the database
mongoose.connect('mongodb://localhost/PWP_Mongodb', {
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
