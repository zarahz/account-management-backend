const userLib = require('../lib/user');

function makeid(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const generateUniqueValue = () => {
  const uniqueValue = `AUSERTESTTOBEDELETEDSOONDONOTUSE${makeid(16)}`;
  return uniqueValue;
};

/**
 * Complete user example.
 */
const testUser = () => ({
  gender: 'female',
  firstname: 'test',
  lastname: 'user',
  username: generateUniqueValue(),
  email: generateUniqueValue(),
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
});

/**
 * Complete second user example (mainly for duplication testing)
 */
const testUser2 = () => ({
  firstname: 'test',
  lastname: 'user2',
  username: generateUniqueValue(),
  email: generateUniqueValue(),
  password: 'test',
  fieldOfActivity: 'Computer Science',
  researchInterest: 'VR',
  role: 'user',
  securityQuestion: 'a test question',
  securityAnswer: 'test',
});

/**
 * remove test data
 */
const removeTestData = async () => {
  let testusers = null;
  await userLib.queryUser('AUSERTESTTOBEDELETEDSOONDONOTUSE', ['username', 'email'])
    .then((users) => {
      testusers = users;
    });

  if (testusers) {
    await Promise.all(testusers.map((user) => userLib.deleteUser(user.username)));
  }
};

module.exports = {
  testUser, testUser2, generateUniqueValue, removeTestData,
};
