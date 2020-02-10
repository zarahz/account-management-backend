const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('./db');

const app = express();
const port = 10014;

// cors settings to allow the whitelist urls to access the api
const whitelist = ['pwp.um.ifi.lmu.de', 'localhost'];
const checkUrl = (origin, callback) => {
  // check if the current url is contained in the whitelist
  let match = false;
  whitelist.forEach((entry) => {
    if (!match && (
      !origin || origin.includes(entry))) {
      callback(null, true);
      match = true;
    }
  });
  // if no whitelist entry matched do not allow access
  if (!match) {
    callback(new Error('Not allowed by CORS'));
  }
};
// activate the cors functionality
app.use(cors({ credentials: true, origin: checkUrl }));

app.use(bodyParser.json());

app.options('*', cors());
app.get('/', async (req, res) => { res.sendFile('views/Welcome.html', { root: __dirname }); });

// user API
app.use(require('./routes/user'));

// Form Validation API
app.use(require('./routes/formValidation'));

// collections API
app.use(require('./routes/collection'));

// authentification API
app.use(require('./routes/authentification'));

// eslint-disable-next-line no-console
const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`));

module.exports = server;
