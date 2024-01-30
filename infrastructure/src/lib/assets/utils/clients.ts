import { S3Client } from '@aws-sdk/client-s3';
import { SQSClient } from '@aws-sdk/client-sqs';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import * as AWSXRay from 'aws-xray-sdk';

// Clients
const s3Client = AWSXRay.captureAWSv3Client(new S3Client());
const sqsClient = AWSXRay.captureAWSv3Client(new SQSClient());
const dynamodbClient = AWSXRay.captureAWSv3Client(new DynamoDBClient());

export { s3Client, sqsClient, dynamodbClient };
