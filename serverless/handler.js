'use strict';

module.exports.hello = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      message: 'Go Serverless v1.0! Your function executed successfully! uid: ' + event.requestContext.authorizer.principalId,
      input: event,
    }),
  };
  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};

module.exports.status = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      message: 'TEST_VALUE ' + process.env.TEST_VALUE,
      input: event,
    }),
  };
};
  
