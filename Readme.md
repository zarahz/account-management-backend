# Account Management Backend

This Javascript Project defines all Endpoints of the Conference Tool concerning Account Management (Reachable via pwp.um.ifi.lmu.de/g14). It is mainly build with Node.js and Express.

## Getting Started

### Prerequisites

Run the following command to install all necessary npm modules.

```
npm install
```

### Run the Project locally 

In order to run the project locally use this command:

```
npm run build
```

Opening localhost:[portNumber] (default: 10014) will show you the backend Documentation. All endpoints and requirements can be found there including the structure of the user model. You can use Postman, Insomnia or any other Programm to execute requests.

### Example

```
(GET) localhost:[portNumber]/researchInterests
```

States all research interests a user can choose from within the conference Tool. (The same goes for the deployed Endpoint
pwp.um.ifi.lmu.de/g14/researchInterests).

## Running the tests

We used Jest and Supertest to test our Endpoints and Database functions. 
To execute them run the following command:

```
npm run test
```

## Deployment

In order to Deploy the project on the server (pwpg14) navigate into account-management-backend and pull new git changes. Afterwards execute
```
pm2 restart backend
```
or
```
PORT=10014 pm2 start ./src/server [optional: --name backend]
```