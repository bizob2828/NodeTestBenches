'use strict';
const AWS = require('aws-sdk')
const { SQSClient, SendMessageCommand, ReceiveMessageCommand } = require('@aws-sdk/client-sqs');
const { SNSClient, PublishCommand  } = require('@aws-sdk/client-sns');
const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const { PutCommand, DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const { v4: uuid } = require('uuid');
const sns = new AWS.SNS({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  region: 'us-east-2'
});
const sqs = new AWS.SQS({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  region: 'us-east-2'
});

const s3 = new AWS.S3({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  region: 'us-east-2'
})

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

const docClient = DynamoDBDocumentClient.from(ddb);

const s3Client= new S3Client({
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
    const data = await sns.publish({ MessageGroupId: '23423', TopicArn: 'arn:aws:sns:us-east-2:534933490068:nodejs-bob-test.fifo', Message: 'testing' }).promise()
    reply.send(data);
  });

  fastify.get('/aws/sns-client', async (request, reply) => {
    const data = await snsClient.send(new PublishCommand({ MessageGroupId: '123121', TopicArn: 'arn:aws:sns:us-east-2:534933490068:nodejs-bob-test.fifo', Message: 'testing' }))
    reply.send(data);
  });

  fastify.get('/aws/sqs', async (request, reply) => {
    await sqs.sendMessage({ QueueUrl: 'https://sqs.us-east-2.amazonaws.com/534933490068/nodejs-bob-test', MessageBody: 'testing' }).promise();
    const data = await sqs.receiveMessage({ QueueUrl: 'https://sqs.us-east-2.amazonaws.com/534933490068/nodejs-bob-test' }).promise()
    reply.send(data)
  });

  fastify.get('/aws/s3', async(request, reply) => {
    const params = {
      Bucket: 'arn:aws:s3:us-east-2:534933490068:accesspoint/accesspoint',
      Key: 'test',
      Body: 'my-body'
    }
    const data = await s3.putObject(params).promise()
    await Promise.all([data, snsData])
    reply.send(data)
  });

  fastify.get('/aws/sqs-client', async (request, reply) => {
    await sqsClient.send(new SendMessageCommand({ QueueUrl: 'https://sqs.us-east-2.amazonaws.com/534933490068/nodejs-bob-test', MessageBody: 'testing' }));
    const data = await sqsClient.send(new ReceiveMessageCommand({ QueueUrl: 'https://sqs.us-east-2.amazonaws.com/534933490068/nodejs-bob-test'}));
    reply.send(data)
  });

  fastify.get('/aws/dynamo-put', async (request, reply) => {
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

  fastify.get('/aws/dynamo-doc-put', async(request, reply) => {
    const id = uuid();
    const params = {
      TableName: 'nodejb-bob-test',
      Item: {
        id,
        name: id
      }
    }
    const data = await docClient.send(new PutCommand(params))
    reply.send(data)
  });

  fastify.get('/aws/s3-put', async(request, reply) => {
    const params = {
      Bucket: 'arn:aws:s3:us-east-2:534933490068:accesspoint/accesspoint',
      Key: 'test',
      Body: 'my-body'
    }
    const data = await s3Client.send(new PutObjectCommand(params))
    reply.send(data)
  });
};
