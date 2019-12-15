const request = require('supertest');
const express = require('express');

let server;
let agent;

beforeEach((done) => {
  const app = express();
  server = app.listen(10014, (err) => {
    if (err) return done(err);

    // since the application is already listening, it should use the allocated port
    agent = request.agent(server);
    return done();
  });
});

/**
   * Clear all test data after every test.
   */
afterEach((done) => {
  if (server) {
    console.log('close server');
    server.close(done);
  }
  done();
});

/**
 * User test suite.
 */
describe('GET Collection', () => {
  it('todo', () => {
    expect(true).toBeTruthy();
  });
  /* it('securityQuestions', async (done) => {
    agent
      .get('/securityQuestions')
      .expect(200, done);
  }); */
});
