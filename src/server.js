const app = require('./app');

const port = 10014;

// eslint-disable-next-line no-console
const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`));

module.exports = server;
