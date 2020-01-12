const request = require('supertest');
const express = require('express');
// const app = require('../server');

/**
   * Clear all test data after every test.
   */
afterEach((done) => {
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
