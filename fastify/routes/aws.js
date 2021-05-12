'use strict';
const { SQS, SQSClient, SendMessageCommand, ReceiveMessageCommand } = require('@aws-sdk/client-sqs');
const { SNS, SNSClient, PublishCommand  } = require('@aws-sdk/client-sns');
const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const { v4: uuid } = require('uuid');
const sns = new SNS({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  region: 'us-east-2'
});
const sqs = new SQS({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  region: 'us-east-2'
});

const snsClient = new SNSClient({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  region: 'us-east-2'
});
const sqsClient = new SQSClient({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  region: 'us-east-2'
});

const ddb = new DynamoDBClient({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  region: 'us-east-2'
});

/**
 * @vulnerability: csp-header-insecure
 */
module.exports = async function(fastify, options) {
  fastify.get('/aws', (request, reply) => {
    reply.view('aws', { ...options });
  });

  fastify.get('/aws/sns', async (request, reply) => {
    const data = await sns.publish({ MessageGroupId: '23423', TopicArn: 'arn:aws:sns:us-east-2:534933490068:nodejs-bob-test.fifo', Message: 'testing' })
    reply.send(data);
  });

  fastify.get('/aws/sns-client', async (request, reply) => {
    const data = await snsClient.send(new PublishCommand({ MessageGroupId: '123121', TopicArn: 'arn:aws:sns:us-east-2:534933490068:nodejs-bob-test.fifo', Message: 'testing' }))
    reply.send(data);
  });

  fastify.get('/aws/sqs', async (request, reply) => {
    await sqs.sendMessage({ QueueUrl: 'https://sqs.us-east-2.amazonaws.com/534933490068/nodejs-bob-test', MessageBody: 'testing' });
    const data = await sqs.receiveMessage({ QueueUrl: 'https://sqs.us-east-2.amazonaws.com/534933490068/nodejs-bob-test' })
    reply.send(data)
  });

  fastify.get('/aws/sqs-client', async (request, reply) => {
    await sqsClient.send(new SendMessageCommand({ QueueUrl: 'https://sqs.us-east-2.amazonaws.com/534933490068/nodejs-bob-test', MessageBody: 'testing' }));
    const data = await sqsClient.send(new ReceiveMessageCommand({ QueueUrl: 'https://sqs.us-east-2.amazonaws.com/534933490068/nodejs-bob-test'}));
    reply.send(data)
  });

  fastify.get('/aws/dynamo-put', async (request, reply) => {
    debugger;
    const id = uuid();
    const params = {
      TableName: 'nodejb-bob-test',
      Item: {
        id: { S: id},
        name: { S: id }
      }
    }
    const data = await ddb.send(new PutItemCommand(params))
    reply.send(data)
  });
};
