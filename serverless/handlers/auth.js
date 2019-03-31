'use strict';
const log = require("json-log").log;
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const db = require('../db');


// only initialize the firebase admin app once...
if (admin.apps.length == 0) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FB_ADMIN_SA_PROJECT_ID,
      clientEmail: process.env.FB_ADMIN_SA_CLIENT_EMAIL,
      privateKey: process.env.FB_ADMIN_SA_PRIVATE_KEY
    }),
    databaseURL: 'https://' + process.env.FB_ADMIN_SA_DB_NAME + '.firebaseio.com'
  });
}


module.exports.tokensignin = async (event, context) => {
  // https://firebase.google.com/docs/admin/setup
  // https://firebase.google.com/docs/auth/admin/verify-id-tokens  
  let params = JSON.parse(event.body);
  let idToken = params.idToken;
  let response = {};

  try {
    let decodedToken = await admin.auth().verifyIdToken(idToken);
    let uid = decodedToken.uid;     // this is the identifier to use to uniquely track this user, also known as sub
    let name = decodedToken.name;   // name of user
    let email = decodedToken.email;   // email of user
    let picture = decodedToken.picture;   // URL for picture of user

    // TODO: check if User with this uid exists
    try {
      var user = await db.getUserByUid(context, {uid: uid});
    } catch (error) {
      log.error("Checking for user", {uid: uid, error: error})
    }

    // If not, create the User with above data
    if (user == null) {
      try {
        user = await db.createUser({uid: uid, name: name, email: email, pictureUrl: picture, cycleOrder: []});
      } catch (error) {
        log.error("Error while creating user", {error: error});
      }
    }

    // only genrate the session if the User exists
    if (user != null) {
      // generate JWT session ID
      var sessionId = jwt.sign({ uid: uid, created: Date.now() }, process.env.JWT_SECRET);
    }
  } catch (error) {
    log.error("Error while verifying id token", {error: error});
  }

  if (sessionId) {
    response = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://www.okayare.com',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        message: 'ID Token received, session generated.',
        sessionId: sessionId
      })
    };
  } else {
    response = {
      statusCode: 401,
      headers: {
        'Access-Control-Allow-Origin': 'https://www.okayare.com',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        message: 'Error during session creation',
        error: error,
        idToken: idToken
      })
    };
  }

  return response
}


// Policy helper function
// https://github.com/serverless/examples/blob/master/aws-node-auth0-custom-authorizers-api/handler.js
const generatePolicy = (principalId, effect, resource) => {
    const authResponse = {};
    authResponse.principalId = principalId;
    if (effect && resource) {
      const policyDocument = {};
      policyDocument.Version = '2012-10-17';
      policyDocument.Statement = [];
      const statementOne = {};
      statementOne.Action = 'execute-api:Invoke';
      statementOne.Effect = effect;
      statementOne.Resource = resource;
      policyDocument.Statement[0] = statementOne;
      authResponse.policyDocument = policyDocument;
    }
    return authResponse;
}

// AWS Lamdba Authorizer entrypoint
// https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-use-lambda-authorizer.html
// https://github.com/serverless/examples/blob/master/aws-node-auth0-custom-authorizers-api/handler.js
module.exports.verifyToken = async (event, context, callback) => {
    // check header or url parameters or post parameters for token
    const token = event.authorizationToken;
    log.info("verifyToken token", {token: token})

    if (!token) return callback(null, 'Unauthorized');

    // verifies secret and checks exp
    log.info("verifyToken calling jwt.verify")
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return callback(null, 'Unauthorized');

        // if everything is good, save to request for use in other routes
        // the uid specified here will be available to AWS Lambda function as part of the event
        // (event.requestContext.authorizer.principalId)
        log.info("verifyToken decoded", {decoded: decoded})
        return callback(null, generatePolicy(decoded.uid, 'Allow', event.methodArn))
    });

}
