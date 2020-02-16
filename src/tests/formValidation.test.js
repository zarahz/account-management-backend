const request = require('supertest');
const userLib = require('../lib/user');
const dbHandler = require('./dbHandler');
const app = require('../app');
const { testUser, removeTestData } = require('./testdata');

/**
 * Connect to a new in-memory database before running any tests.
 */
beforeAll(async (done) => {
  dbHandler.connect();
  done();
});

/**
 * Remove and close the db and server.
 */
afterAll(async (done) => {
  await removeTestData();
  dbHandler.closeDatabase();
  done();
});

describe('form validation route', () => {
  it('has unique username', async (done) => {
    const res = await request(app).get('/uniqueUsername?username=aVERYUniqueUsernameThatNobodyTookYET');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeTruthy();
    done();
  });
  it('has no unique username', async (done) => {
    const dbUser = await userLib.createUser(testUser());
    const res = await request(app).get(`/uniqueUsername?username=${dbUser.username}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).not.toBeTruthy();
    done();
  });
  it('has unique email', async (done) => {
    const res = await request(app).get('/uniqueEmail?email=aUniqueEmail');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeTruthy();
    done();
  });
  it('has no unique email', async (done) => {
    const dbUser = await userLib.createUser(testUser());
    const res = await request(app).get(`/uniqueEmail?email=${dbUser.email}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).not.toBeTruthy();
    done();
  });
});
