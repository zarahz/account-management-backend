const request = require('supertest');
const dbHandler = require('./dbHandler');
const userLib = require('../lib/user');
const app = require('../server');

let token;
/**
 * Connect to a new in-memory database before running any tests.
 */
beforeAll((done) => {
  dbHandler.connect();
  done();
});

/**
 * Clear all test data after every test.
 */
afterEach((done) => {
  dbHandler.clearDatabase();
  app.close();
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
  username: Math.random().toString(36).substring(2, 15),
  email: Math.random().toString(36).substring(2, 15),
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
const testUser2 = {
  firstname: 'test',
  lastname: 'user2',
  username: Math.random().toString(36).substring(2, 15),
  email: Math.random().toString(36).substring(2, 15),
  password: 'test',
  organisation: 'LMU',
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
    const user = await userLib.createUser(testUser);
    expect(user.username).toBeTruthy();
    done();
  });
  it('can not be created - incomplete user', async (done) => {
    let message = false;
    try {
      await userLib.createUser({ firstname: 'test', lastname: 'test' });
    } catch (e) {
      message = e.message;
    }
    expect(message).toBeTruthy();
    done();
  });
  it('can not be created - duplicate values', async (done) => {
    let message = false;
    try {
      await userLib.createUser(testUser);
      await userLib.createUser(testUser);
    } catch (e) {
      message = true;
    }
    expect(message).not.toBeTruthy();
    done();
  });
  it('can authenticate correcly', async (done) => {
    expect(async () => userLib.authenticateUser(testUser.username, testUser.password)).toBeTruthy();
    done();
  });
  it('with wrong authentication data', async (done) => {
    const user = await userLib.authenticateUser('notExtisting', 'FAILS');
    expect(user).toEqual(-1);
    done();
  });

  /**
   * Test API points
   */
  it('can login successfully', async (done) => {
    const newUser = await userLib.createUser(testUser);
    const res = await request(app).post('/login')
      .send({
        username: newUser.username,
        password: 'test',
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
    done();
  });
  it('cannot login - wrong username', async (done) => {
    // const newUser = await userLib.createUser(testUser);
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
    const newUser = await userLib.createUser(testUser);
    const res = await request(app).post('/login')
      .send({
        username: newUser.username,
        password: 'a wrong password',
      });
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('error');
    done();
  });
  it('can register successfully', async (done) => {
    // const newUser = await userLib.createUser(testUser);
    const res = await request(app).post('/register').send(testUser);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
    done();
  });
  it('cannot register - username exists', async (done) => {
    const dbUser = await userLib.createUser(testUser);
    testUser2.username = dbUser.username;
    const res = await request(app).post('/register').send(testUser2);
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
    done();
  });
  it('cannot register - email exists', async (done) => {
    const dbUser = await userLib.createUser(testUser);
    testUser2.email = dbUser.email;
    const res = await request(app).post('/register').send(testUser2);
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
    done();
  });
  it('cannot register - required field missing', async (done) => {
    // const dbUser = await userLib.createUser(testUser);
    delete testUser2.email;
    const res = await request(app).post('/register').send(testUser2);
    expect(res.statusCode).toEqual(500);
    expect(res.body).toHaveProperty('error');
    done();
  });
  it('has unique username', async (done) => {
    const res = await request(app).get('/uniqueUsername?username=aUniqueUsername');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeTruthy();
    done();
  });
  it('has not unique username', async (done) => {
    const dbUser = await userLib.createUser(testUser);
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
  it('has not unique email', async (done) => {
    const dbUser = await userLib.createUser(testUser);
    const res = await request(app).get(`/uniqueEmail?email=${dbUser.email}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).not.toBeTruthy();
    done();
  });
  it('answers security question right', async (done) => {
    const dbUser = await userLib.createUser(testUser, true);
    const res = await request(app).post('/checkSecurityAnswer')
      .send({
        id: dbUser.id,
        securityAnswer: dbUser.securityAnswer,
      });
    expect(res.statusCode).toEqual(200);
    done();
  });
  it('answers security question wrong', async (done) => {
    const dbUser = await userLib.createUser(testUser);
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
  it('get event role', async (done) => {
    const dbUser = await userLib.createUser(testUser);
    const res = await request(app).get(`/userRoleByID?id=${dbUser.id}&event=${dbUser.eventbasedRole[0].event}&token=${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('role');
    done();
  });
  it('cannot get event role - no user found', async (done) => {
    const res = await request(app).get(`/userRoleByID?id=000000000000000000000000&event=1&token=${token}`);
    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty('error');
    done();
  });
  it('cannot get event role - no event found', async (done) => {
    const dbUser = await userLib.createUser(testUser);
    const res = await request(app).get(`/userRoleByID?id=${dbUser.id}&event=1234567890&token=${token}`);
    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty('error');
    done();
  });
  it('get by id', async (done) => {
    const dbUser = await userLib.createUser(testUser);
    const res = await request(app).get(`/userByID?id=${dbUser.id}&token=${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('user');
    done();
  });
  it('cannot get by id - invalid id', async (done) => {
    const res = await request(app).get(`/userByID?id=000000000000000000000000&token=${token}`);
    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty('error');
    done();
  });
  it('searches successfully without specific attributes', async (done) => {
    await userLib.createUser(testUser);
    const res = await request(app).post(`/queryUser?token=${token}`)
      .send({
        searchTerm: 'us',
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).not.toEqual(0);
    done();
  });
  it('searches with no result without specific attributes', async (done) => {
    await userLib.createUser(testUser);
    const res = await request(app).post(`/queryUser?token=${token}`)
      .send({
        searchTerm: 'userZZZZZZZ',
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(0);
    done();
  });
  it('searches with no searchTerm without specific attributes', async (done) => {
    await userLib.createUser(testUser);
    const res = await request(app).post(`/queryUser?token=${token}`);
    expect(res.statusCode).toEqual(200);
    done();
  });
  it('searches successfully with specific attributes', async (done) => {
    await userLib.createUser(testUser);
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
    await userLib.createUser(testUser);
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
    await userLib.createUser(testUser);
    const res = await request(app).post(`/queryUser?token=${token}`)
      .send({
        attributes: ['firstname'],
      });
    expect(res.statusCode).toEqual(200);
    done();
  });
  it('fetch research interest by id successfully', async (done) => {
    const dbUser = await userLib.createUser(testUser);
    const res = await request(app).get(`/researchInterestByID?id=${dbUser.id}&token=${token}`);
    expect(res.statusCode).toEqual(200);
    done();
  });
  it('fetch research interest by id - user not found', async (done) => {
    await userLib.createUser(testUser);
    const res = await request(app).get(`/researchInterestByID?id=000000000000000000000000&token=${token}`);
    expect(res.statusCode).not.toEqual(200);
    expect(res.body).toHaveProperty('error');
    done();
  });
  it('updates data successfully ', async (done) => {
    const dbUser = await userLib.createUser(testUser);
    const res = await request(app).patch(`/updateUser/${dbUser.id}/token=${token}`)
      .send({
        username: 'updated Username',
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    done();
  });
  it('updates data - duplicate values ', async (done) => {
    const dbUser = await userLib.createUser(testUser);
    const dbUser2 = await userLib.createUser(testUser2);
    const res = await request(app).patch(`/updateUser/${dbUser.id}/token=${token}`)
      .send({
        username: dbUser2.username,
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
    done();
  });
  it('updates data - no user found', async (done) => {
    await userLib.createUser(testUser);
    const res = await request(app).patch(`/updateUser/000000000000000000000000/token=${token}`)
      .send({
        username: 'username',
      });
    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty('error');
    done();
  });
  it('updates password successfully', async (done) => {
    const dbUser = await userLib.createUser(testUser);
    const res = await request(app).patch(`/updatePassword/${dbUser.id}/token=${token}`)
      .send({
        newPassword: 'newPassword',
      });
    expect(res.statusCode).toEqual(200);
    done();
  });
});
