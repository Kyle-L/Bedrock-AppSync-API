import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import {
  AwsCustomResource,
  AwsCustomResourcePolicy
} from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';
import getDefaultPersonas from '../assets/data/default-personas';
import * as s3 from 'aws-cdk-lib/aws-s3';

export interface DataStoreProps {
  removalPolicy?: cdk.RemovalPolicy;
  knowledgeBaseId?: string;
}

/**
 * A construct that manages the data stores for the application.
 * It creates a DynamoDB table for storing conversation history and a custom resource
 * to add the default personas to the table.
 *
 * @class DataStoreConstruct
 * @extends {Construct}
 */
export class DataStoreConstruct extends Construct {
  readonly table: dynamodb.Table;
  readonly bucket: s3.Bucket;

  constructor(scope: Construct, id: string, props?: DataStoreProps) {
    super(scope, id);

    // A conversation history table
    this.table = new dynamodb.Table(this, 'ConversationHistory', {
      partitionKey: {
        name: 'pk',
        type: dynamodb.AttributeType.STRING
      },
      sortKey: {
        name: 'sk',
        type: dynamodb.AttributeType.STRING
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: props?.removalPolicy
    });

    // Add the default items to the table using custom resources
    new AwsCustomResource(this, 'Personas', {
      onCreate: {
        service: 'DynamoDB',
        action: 'batchWriteItem',
        parameters: {
          RequestItems: {
            [this.table.tableName]: getDefaultPersonas({
              knowledgeBaseId: props?.knowledgeBaseId
            }).map((item) => ({
              PutRequest: {
                Item: item
              }
            }))
          }
        },
        physicalResourceId: {
          id: 'DefaultPersonas'
        }
      },
      policy: AwsCustomResourcePolicy.fromSdkCalls({
        resources: [this.table.tableArn]
      })
    });

    // S3 bucket for storing audio files and other assets.
    this.bucket = new s3.Bucket(this, 'PredictionBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      lifecycleRules: [
        {
          prefix: 'audio/',
          expiration: cdk.Duration.days(1)
        }
      ]
    });
  }
}
