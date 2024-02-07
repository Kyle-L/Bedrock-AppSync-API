import { BedrockAgentRuntimeClient } from '@aws-sdk/client-bedrock-agent-runtime';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { S3Client } from '@aws-sdk/client-s3';
import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { SQSClient } from '@aws-sdk/client-sqs';
import * as AWSXRay from 'aws-xray-sdk';
import * as http from 'http';
import * as https from 'https';

// Clients
const bedrockAgentRuntimeClient = AWSXRay.captureAWSv3Client(
  new BedrockAgentRuntimeClient({ region: 'us-east-1' })
);
const dynamodbClient = AWSXRay.captureAWSv3Client(new DynamoDBClient());
const s3Client = AWSXRay.captureAWSv3Client(new S3Client());
const sqsClient = AWSXRay.captureAWSv3Client(new SQSClient());
const ssmClient = AWSXRay.captureAWSv3Client(new SecretsManagerClient());

// Http clients
const httpClient = AWSXRay.captureHTTPs(http);
const httpsClient = AWSXRay.captureHTTPs(https);

export {
  bedrockAgentRuntimeClient,
  dynamodbClient,
  httpClient,
  httpsClient,
  s3Client,
  sqsClient,
  ssmClient
};
