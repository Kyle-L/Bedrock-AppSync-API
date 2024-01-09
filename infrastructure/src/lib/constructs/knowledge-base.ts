import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as bedrockAgentCDK from 'bedrock-agents-cdk';
import { Construct } from 'constructs';

export interface KnowledgeBaseConstructProps extends cdk.StackProps {
  pineconeConnectionString: string;
}

export class KnowledgeBaseConstruct extends Construct {
  public readonly knowledgeBase: bedrockAgentCDK.BedrockKnowledgeBase;

  constructor(scope: Construct, id: string, props: KnowledgeBaseConstructProps) {
    super(scope, id);

    const pineconeKbName = `${scope.node.path.replace(/\//g, '-')}-KnowledgeBase`;
    const pineconeConnectionString = props.pineconeConnectionString;
    const textField = 'text-field';
    const metadataField = 'metadata-field';
    const pineconeStorageConfigurationType = 'PINECONE';

    // A bucket to store data for the knowledge base
    const bucket = new s3.Bucket(this, 'Bucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true
    });

    // Bedrock Knowledge Base IAM role
    const knowledgeBaseRoleArn = new iam.Role(this, 'KnowledgeBaseRole', {
      roleName: 'AmazonBedrockExecutionRoleForKnowledgeBase_CDK',
      assumedBy: new iam.ServicePrincipal('bedrock.amazonaws.com'),
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess')]
    }).roleArn;

    // Create a secret for the Pinecone credentials
    // See https://www.pinecone.io/blog/amazon-bedrock-integration/ for more details.
    const pineconeSecret = new secretsmanager.Secret(this, 'PineconeSecret', {
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ apiKey: 'value' }),
        generateStringKey: 'apiKey'
      }
    });

    this.knowledgeBase = new bedrockAgentCDK.BedrockKnowledgeBase(this, 'KnowledgeBase', {
      name: pineconeKbName,
      roleArn: knowledgeBaseRoleArn,
      storageConfiguration: {
        pineconeConfiguration: {
          credentialsSecretArn: pineconeSecret.secretArn,
          connectionString: pineconeConnectionString,
          fieldMapping: {
            metadataField: metadataField,
            textField: textField
          }
        },
        type: pineconeStorageConfigurationType
      },
      dataSource: {
        dataSourceConfiguration: {
          s3Configuration: {
            bucketArn: bucket.bucketArn
          }
        }
      }
    });
  }
}
