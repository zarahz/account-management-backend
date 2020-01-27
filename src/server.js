const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('./db');

const app = express();
const port = 10014;

// cors settings
const whitelist = ['pwp.um.ifi.lmu.de', 'localhost']; // 'https://pwp.um.ifi.lmu.de/g14', 'http://localhost:3000'
const checkUrl = (origin, callback) => {
  let match = false;
  whitelist.forEach((entry) => {
    if (!match && (
      !origin || origin.includes(entry))) {
      callback(null, true);
      match = true;
    }
  });

  if (!match) {
    callback(new Error('Not allowed by CORS'));
  }
};
app.use(cors({ credentials: true, origin: checkUrl }));

app.use(bodyParser.json());

app.options('*', cors());
app.get('/', async (req, res) => { res.sendFile('views/Welcome.html', { root: __dirname }); });

// user API
app.use(require('./routes/user'));

// authentification API
app.use(require('./routes/formValidation'));

// collections API
app.use(require('./routes/collection'));

// authentification API
app.use(require('./routes/authentification'));

// eslint-disable-next-line no-console
const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`));

module.exports = server;
