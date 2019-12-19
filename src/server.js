const express = require('express');
const bodyParser = require('body-parser');
// const cors = require('cors');
require('./db');

const app = express();
const port = 10014;

/* const corsOptions = {
  origin: 'https://pwp.um.ifi.lmu.de',
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
}; */
// cors settings
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  );
  next();
});

// All OPTIONS requests return a simple status: 'OK'
app.options('*', (req, res) => {
  res.json({
    status: 'OK',
  });
});

app.use(bodyParser.json());
app.get('/', async (req, res) => { res.sendFile('views/Welcome.html', { root: __dirname }); });

// user API
app.use(require('./routes/user'));

// collections API
app.use(require('./routes/collection'));

// eslint-disable-next-line no-console
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
