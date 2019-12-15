const request = require('supertest');
const express = require('express');
const dbHandler = require('./dbHandler');
const userLib = require('../lib/user');

let server;
// let agent;

/**
 * Connect to a new in-memory database before running any tests.
 */
beforeAll((done) => {
  dbHandler.connect();
  done();
});

beforeEach((done) => {
  const app = express();
  server = app.listen(4000, (err) => {
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
  // close server
  if (server) {
    server.close(done);
  }
  dbHandler.clearDatabase();
  done();
});

/**
 * Remove and close the db and server.
 */
afterAll((done) => {
  dbHandler.closeDatabase();
  done();
});


/**
 * Complete user example.
 */
const testUser = {
  gender: 'female',
  firstname: 'test',
  lastname: 'user',
  username: 'testUser',
  email: 'email',
  password: 'test',
  organisation: 'LMU',
  address: 'test address',
  city: 'test city',
  country: 'test country',
  zipCode: 123456,
  fieldOfActivity: 'Computer Science',
  researchInterest: 'VR',
  role: 'user',
  securityQuestion: 'a test question',
  securityAnswer: 'test',
  eventbasedRole: [
    {
      role: 'presenter',
      event: 1, // contains id of event
    },
  ],
};

/**
 * User test suite.
 */
describe('user', () => {
  it('can be created correctly', async (done) => {
    const user = await userLib.create(testUser);
    expect(user.username).toBeTruthy();
    done();
  });
  it('can not be created - incomplete user', async (done) => {
    let message = false;
    try {
      await userLib.create({ firstname: 'test', lastname: 'test' });
    } catch (e) {
      message = e.message;
    }
    expect(message).toBeTruthy();
    done();
  });
  it('can not be created - duplicate values', async (done) => {
    let message = false;
    try {
      await userLib.create(testUser);
      await userLib.create(testUser);
    } catch (e) {
      message = e.message;
    }
    expect(message).toBeTruthy();
    done();
  });
  it('can authenticate correcly', async (done) => {
    expect(async () => userLib.authenticate(testUser.username, testUser.password)).toBeTruthy();
    done();
  });
  it('with wrong authentication data', async (done) => {
    const user = await userLib.authenticate('notExtisting', 'FAILS');
    expect(user).toEqual(null);
    done();
  });

  /**
   * Test API points

  it('can login successfully', async (done) => {
    const user = await userLib.create(testUser);
    const res = await agent.post('/login')
      .send({
        username: user.username,
        password: user.password,
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('userID');
    done();
  }); */
});
