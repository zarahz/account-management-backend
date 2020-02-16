const request = require('supertest');
const userLib = require('../lib/user');
const dbHandler = require('./dbHandler');
const app = require('../app');
const { generateToken } = require('../util/sign');
const {
  testUser, testUser2, generateUniqueValue, removeTestData,
} = require('./testdata');


/**
 * Connect to a Pin-memory database before running any tests.
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

/**
 * User test suite.
 */
describe('user route', () => {
  /**
   * /register
   */
  it('can register successfully', async (done) => {
    const res = await request(app).post('/register').send(testUser());
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    done();
  });
  it('cannot register - username exists', async (done) => {
    const dbUser = await userLib.createUser(testUser());
    const testUser2Instance = testUser2();
    testUser2Instance.username = dbUser.username;
    const res = await request(app).post('/register').send(testUser2Instance);
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
    done();
  });
  it('cannot register - email exists', async (done) => {
    const dbUser = await userLib.createUser(testUser());

    const testUserInstance = testUser2();
    testUserInstance.email = dbUser.email;
    const res = await request(app).post('/register').send(testUserInstance);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
    done();
  });
  it('cannot register - required field missing', async (done) => {
    // const dbUser = await userLib.createUser(testUser());
    const user = { ...testUser2() };
    delete user.email;
    const res = await request(app).post('/register').send(user);
    expect(res.statusCode).toEqual(500);
    expect(res.body).toHaveProperty('error');
    done();
  });
  it('get event role', async (done) => {
    const dbUser = await userLib.createUser(testUser());
    const token = generateToken(dbUser.id);
    const res = await request(app).get(`/userRoleByID?id=${dbUser.id}&event=${dbUser.eventbasedRole[0].event}&token=${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('role');
    done();
  });
  it('cannot get event role - no user found', async (done) => { // TODO flaky
    const dbUser = await userLib.createUser(testUser());
    const token = generateToken(dbUser.id);
    const res = await request(app).get(`/userRoleByID?id=000000000000000000000000&event=1&token=${token}`);
    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty('error');
    done();
  });
  it('cannot get event role - no event found', async (done) => {
    const dbUser = await userLib.createUser(testUser());
    const token = generateToken(dbUser.id);
    const res = await request(app).get(`/userRoleByID?id=${dbUser.id}&event=1234567890&token=${token}`);
    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty('error');
    done();
  });

  it('get by id', async (done) => {
    const dbUser = await userLib.createUser(testUser());
    const token = generateToken(dbUser.id);
    const res = await request(app).get(`/userByID?id=${dbUser.id}&token=${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('user');
    done();
  });
  it('cannot get by id - invalid id', async (done) => {
    const dbUser = await userLib.createUser(testUser());
    const token = generateToken(dbUser.id);
    const res = await request(app).get(`/userByID?id=000000000000000000000000&token=${token}`);
    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty('error');
    done();
  });
  it('searches successfully without specific attributes', async (done) => {
    const dbUser = await userLib.createUser(testUser());
    const token = generateToken(dbUser.id);
    const res = await request(app).post(`/queryUser?token=${token}`)
      .send({
        searchTerm: 'us',
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).not.toEqual(0);
    done();
  });
  it('searches with no result without specific attributes', async (done) => {
    const dbUser = await userLib.createUser(testUser());
    const token = generateToken(dbUser.id);
    const res = await request(app).post(`/queryUser?token=${token}`)
      .send({
        searchTerm: 'userZZZZZZZ',
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(0);
    done();
  });
  it('searches with no searchTerm without specific attributes', async (done) => {
    const dbUser = await userLib.createUser(testUser());
    const token = generateToken(dbUser.id);
    const res = await request(app).post(`/queryUser?token=${token}`);
    expect(res.statusCode).toEqual(200);
    done();
  });
  it('searches successfully with specific attributes', async (done) => {
    const dbUser = await userLib.createUser(testUser());
    const token = generateToken(dbUser.id);
    const res = await request(app).post(`/queryUser?token=${token}`)
      .send({
        searchTerm: 'us',
        attributes: ['lastname'],
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).not.toEqual(0);
    done();
  });
  it('searches with no result with specific attributes', async (done) => {
    const dbUser = await userLib.createUser(testUser());
    const token = generateToken(dbUser.id);
    const res = await request(app).post(`/queryUser?token=${token}`)
      .send({
        searchTerm: 'us',
        attributes: ['firstname'],
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(0);
    done();
  });
  it('searches with no searchTerm with specific attributes', async (done) => {
    const dbUser = await userLib.createUser(testUser());
    const token = generateToken(dbUser.id);
    const res = await request(app).post(`/queryUser?token=${token}`)
      .send({
        attributes: ['firstname'],
      });
    expect(res.statusCode).toEqual(200);
    done();
  });
  it('fetch research interest by id successfully', async (done) => {
    const dbUser = await userLib.createUser(testUser());
    const token = generateToken(dbUser.id);
    const res = await request(app).get(`/researchInterestByID?id=${dbUser.id}&token=${token}`);
    expect(res.statusCode).toEqual(200);
    done();
  });
  it('fetch research interest by id - user not found', async (done) => {
    const dbUser = await userLib.createUser(testUser());
    const token = generateToken(dbUser.id);
    const res = await request(app).get(`/researchInterestByID?id=000000000000000000000000&token=${token}`);
    expect(res.statusCode).not.toEqual(200);
    expect(res.body).toHaveProperty('error');
    done();
  });
  it('updates data successfully ', async (done) => {
    const dbUser = await userLib.createUser(testUser());
    const token = generateToken(dbUser.id);
    const res = await request(app).patch(`/updateUser/${dbUser.id}?token=${token}`)
      .send({
        username: generateUniqueValue(),
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    done();
  });
  it('updates data - duplicate values ', async (done) => {
    const dbUser = await userLib.createUser(testUser());
    const dbUser2 = await userLib.createUser(testUser2());
    const token = generateToken(dbUser.id);
    const res = await request(app).patch(`/updateUser/${dbUser.id}?token=${token}`)
      .send({
        username: dbUser2.username,
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
    done();
  });
  it('updates data - no user found', async (done) => {
    const dbUser = await userLib.createUser(testUser());
    const token = generateToken(dbUser.id);
    const res = await request(app).patch(`/updateUser/000000000000000000000000?token=${token}`)
      .send({
        username: generateUniqueValue(),
      });
    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty('error');
    done();
  });
  it('updates password successfully', async (done) => {
    const dbUser = await userLib.createUser(testUser());
    const token = generateToken(dbUser.id);
    const res = await request(app).patch(`/updatePassword/${dbUser.id}?token=${token}`)
      .send({
        newPassword: 'newPassword',
      });
    expect(res.statusCode).toEqual(200);
    done();
  });
});
