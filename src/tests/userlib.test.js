const userLib = require('../lib/user');
const dbHandler = require('./dbHandler');
const { testUser, removeTestData } = require('./testdata');

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
describe('user', () => {
  it('can be created correctly', async (done) => {
    const user = await userLib.createUser(testUser());
    expect(user.username).toBeTruthy();
    done();
  });
  it('can not be created - incomplete user', async (done) => {
    let success = false;
    try {
      await userLib.createUser({ firstname: 'test', lastname: 'test' });
    } catch (e) {
      success = true;
    }
    expect(success).toBeTruthy();
    done();
  });
  it('can not be created - duplicate values', async () => {
    const testUserInstance = testUser();
    await userLib.createUser(testUserInstance);
    const secondCall = await userLib.createUser(testUserInstance);
    expect([-1, -2]).toContain(secondCall);
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
});
