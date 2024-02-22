import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as bedrockAgentCDK from 'bedrock-agents-cdk';
import { Construct } from 'constructs';

export interface KnowledgeBaseConstructProps extends cdk.StackProps {
  pineconeConnectionString: string;
  pineConeSecretArn: string;
}

export class KnowledgeBaseConstruct extends Construct {
  public readonly knowledgeBase: bedrockAgentCDK.BedrockKnowledgeBase;

  constructor(
    scope: Construct,
    id: string,
    props: KnowledgeBaseConstructProps
  ) {
    super(scope, id);

    const pineconeKbName = `${scope.node.path.replace(
      /\//g,
      '-'
    )}-KnowledgeBase`;
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
      roleName: `AmazonBedrockExecutionRoleForKnowledgeBase_CDK_${scope.node.id}`,
      assumedBy: new iam.ServicePrincipal('bedrock.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess')
      ]
    }).roleArn;

    this.knowledgeBase = new bedrockAgentCDK.BedrockKnowledgeBase(
      this,
      'KnowledgeBase',
      {
        name: pineconeKbName,
        roleArn: knowledgeBaseRoleArn,
        storageConfiguration: {
          pineconeConfiguration: {
            credentialsSecretArn: props.pineConeSecretArn,
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
      }
    );
  }
}
