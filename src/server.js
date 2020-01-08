const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
require('./db');

const app = express();
const port = 10014;

// cors settings
app.use(morgan('combined'));
app.use(cors({ origin: '*' }));
// app.use(cors({ credentials: true, origin: '*' }));

app.use(bodyParser.json());

app.options('*', cors());
app.get('/', async (req, res) => { res.sendFile('views/Welcome.html', { root: __dirname }); });

// user API
app.use(require('./routes/user'));

// collections API
app.use(require('./routes/collection'));

// decode user token API
app.use(require('./routes/decoder'));

// eslint-disable-next-line no-console
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
