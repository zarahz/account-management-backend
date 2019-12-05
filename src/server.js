const express = require('express');
require('./db');
const { createUser, authenticateUser } = require('./lib/user');

const app = express();
const port = 3000;

app.get('/', async (req, res) => res.send('Hello World!'));

app.get('/register', async (req, res) => {
  // user needs unique entries for database for email and username
  // used dummy number to ensure uniqueness
  const randomStringNumber = String(Math.round(Math.random() * 10000));
  const user = await createUser('full name', randomStringNumber, randomStringNumber, 'pw');
  res.send(`new user created with username ${user.username}`);
});

app.use(async (req, res, next) => {
  const { username, password } = req.query;
  const user = await authenticateUser(username, password);

  if (!user) {
    return res.status(401).send('Unauthorized!');
  }
  req.user = user;
  return next();
});

// above app.use is called first, which takes the user and pw from the request and authenticates
// if it was sucessful username is displayed
app.get('/user', (req, res) => res.status(200).send(`Hello ${req.user.username}`));

// eslint-disable-next-line no-console
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
