import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { AwsCustomResource, AwsCustomResourcePolicy } from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';
import getDefaultPersonas from '../assets/data/default-personas';

export interface ConversationHistoryProps {
  removalPolicy?: cdk.RemovalPolicy;
}

export class ConversationHistoryConstruct extends Construct {
  readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props?: ConversationHistoryProps) {
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
    new AwsCustomResource(this, 'DefaultPersonas', {
      onCreate: {
        service: 'DynamoDB',
        action: 'batchWriteItem',
        parameters: {
          RequestItems: {
            [this.table.tableName]: getDefaultPersonas().map((item) => ({
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

    // Output the table name and ARN
    new cdk.CfnOutput(this, 'ConversationHistoryTableName', {
      value: this.table.tableName
    });

    new cdk.CfnOutput(this, 'ConversationHistoryTableArn', {
      value: this.table.tableArn
    });
  }
}
