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

describe('user authentification route', () => {
  /**
   * /login
   */
  it('can login successfully', async (done) => {
    const newUser = await userLib.createUser(testUser());
    const res = await request(app).post('/login')
      .send({
        username: newUser.username,
        password: 'test',
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    done();
  });
  it('cannot login - wrong username', async (done) => {
    // const newUser = await userLib.createUser(testUser());
    const res = await request(app).post('/login')
      .send({
        username: '1',
        password: 'test',
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
    done();
  });
  it('cannot login - wrong password', async (done) => {
    const newUser = await userLib.createUser(testUser());
    const res = await request(app).post('/login')
      .send({
        username: newUser.username,
        password: 'a wrong password',
      });
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('error');
    done();
  });

  /**
   * /checkSecurityAnswer
   */
  it('answers security question right', async (done) => {
    const dbUser = await userLib.createUser(testUser(), true);
    const res = await request(app).post('/checkSecurityAnswer')
      .send({
        id: dbUser.id,
        securityAnswer: dbUser.securityAnswer,
      });
    expect(res.statusCode).toEqual(200);
    done();
  });
  it('answers security question wrong', async (done) => {
    const dbUser = await userLib.createUser(testUser());
    const res = await request(app).post('/login')
      .send({
        id: dbUser.id,
        securityAnswer: 'wrong security answer',
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
    done();
  });
  it('answers security question fails - no user found', async (done) => {
    const res = await request(app).post('/login')
      .send({
        id: '000000000000000000000000',
        securityAnswer: 'wrong security answer',
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
    done();
  });
});
