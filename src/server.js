const express = require('express');
const bodyParser = require('body-parser');
require('./db');

const app = express();
const port = 10014;


app.use(bodyParser.json());
app.get('/', async (req, res) => { res.sendFile('views/Welcome.html', { root: __dirname }); });

// user API
app.use(require('./routes/user'));

// collections API
app.use(require('./routes/collection'));

// eslint-disable-next-line no-console
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
