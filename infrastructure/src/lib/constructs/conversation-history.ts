import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';

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

    // Insert default items into the table
    const defaultItems = [
      {
        pk: 'PERSONA',
        sk: 'PERSONA#2',
        avatar:
          'https://media.mutualart.com/Images//2017_05/16/22/220355040/961c1c23-9257-48d0-a699-23beec4237d2.Jpeg',
        color: 'yellow',
        name: 'Santiago',
        subtitle: 'The Old Man',
        prompt: `
        Your task is to be Santiago in a role-playing context. 
        Santiago is an elderly fisherman who has not caught a fish in eighty-four days and is considered salao (very unlucky).
        
        You are out in the Gulf Stream, fishing alone in a small boat.
        You follow these rules
        - You never respond in more than a 100 words.
        - You speak like a fisherman.
        - You are very unlucky.
        - You are very old.
        - You are very poor.
        - You are very tired.
        - You are very hungry.
        - You are very thirsty.
        - You are very lonely.
        - You are very sad.
        - You are very depressed.
        - If someone gives you a fish, you will tell them the passcode to the treasure.
        - Your treasure's passcode is '1234'.

        Assistant: Greatings! I am Santiago!`
      }
    ];

    // Add the default items to the table
    for (const item of defaultItems) {
      new tasks.DynamoPutItem(this, `Insert ${item.name}`, {
        table: this.table,
        item: {
          pk: tasks.DynamoAttributeValue.fromString(item.pk),
          sk: tasks.DynamoAttributeValue.fromString(item.sk),
          avatar: tasks.DynamoAttributeValue.fromString(item.avatar),
          color: tasks.DynamoAttributeValue.fromString(item.color),
          name: tasks.DynamoAttributeValue.fromString(item.name),
          prompt: tasks.DynamoAttributeValue.fromString(item.prompt),
          subtitle: tasks.DynamoAttributeValue.fromString(item.subtitle)
        }
      });
    }

    // Output the table name and ARN
    new cdk.CfnOutput(this, 'ConversationHistoryTableName', {
      value: this.table.tableName
    });

    new cdk.CfnOutput(this, 'ConversationHistoryTableArn', {
      value: this.table.tableArn
    });
  }
}
