import * as cdk from 'aws-cdk-lib';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as opensearchserverless from 'aws-cdk-lib/aws-opensearchserverless';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { BedrockAgent, BedrockKnowledgeBase } from 'bedrock-agents-cdk';
import { Construct } from 'constructs';

export class AgentConstruct extends Construct {
  public readonly appsync: appsync.GraphqlApi;

  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id);

    const agentName = 'my-test-agent';
    const foundationModel = 'anthropic.claude-instant-v1';
    const agentInstruction = 'This is a template instruction for my agent. You were created by AWS CDK.';
    const openSearchKbName = 'my-test-kb';
    const kbInstruction = 'This is a template instruction for my knowledge base. You were created by AWS CDK.';
    const vectorIndexName = 'my-test-index';
    const vectorFieldName = 'my-test-vector';
    const textField = 'text-field';
    const metadataField = 'metadata-field';
    const storageConfigurationType = 'OPENSEARCH_SERVERLESS';

    // A role for the Bedrock agent to assume
    const role = new iam.Role(this, 'BedrockKnowledgeBaseRole', {
      roleName: 'AmazonBedrockExecutionRoleForKnowledgeBase_kb_test',
      assumedBy: new iam.ServicePrincipal('bedrock.amazonaws.com'),
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess')]
    });

    // A bucket to store data for the knowledge base
    const bucket = new s3.Bucket(this, 'BedrockKnowledgeBaseBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true
    });

    // A collection for the knowledge base
    const cfnCollection = new opensearchserverless.CfnCollection(this, 'BedrockCollection', {
      name: 'BedrockCollection',
      description: 'description',
      type: 'VECTORSEARCH'
    });

    new BedrockKnowledgeBase(this, 'BedrockKnowledgeBase', {
      name: openSearchKbName,
      description: 'Bedrock Knowledge Base',
      roleArn: role.roleArn,
      dataSource: {
        dataSourceConfiguration: {
          s3Configuration: {
            bucketArn: bucket.bucketArn
          }
        },
        name: 'S3KnowledgeBase'
      },
      storageConfiguration: {
        opensearchServerlessConfiguration: {
          collectionArn: cfnCollection.attrArn,
          fieldMapping: {
            metadataField: metadataField,
            textField: textField,
            vectorField: vectorFieldName
          },
          vectorIndexName: vectorIndexName
        },
        type: storageConfigurationType
      }
    });

    // A knowledge base for the agent
    new BedrockAgent(this, 'BedrockAgent', {
      agentName: agentName,
      instruction: agentInstruction,
      foundationModel: foundationModel,
      knowledgeBaseAssociations: [
        {
          knowledgeBaseName: openSearchKbName,
          instruction: kbInstruction
        }
      ]
    });
  }
}
