import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';

export interface CognitoConstructProps {
  customDomain?: cdk.aws_cognito.CustomDomainOptions;
}

export class AuthConstruct extends Construct {
  readonly userPool: cognito.UserPool;
  readonly userPoolClient: cognito.UserPoolClient;
  readonly userPoolDomain: cognito.UserPoolDomain;
  readonly presignupLambda: NodejsFunction;

  constructor(scope: Construct, id: string, props: CognitoConstructProps) {
    super(scope, id);

    // A Cognito User Pool
    this.userPool = new cognito.UserPool(this, 'UserPool', {
      selfSignUpEnabled: true,
      signInAliases: {
        email: true
      },
      autoVerify: {
        email: true
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true
        }
      }
    });

    // Create Admin User Group
    new cognito.CfnUserPoolGroup(this, 'AdminGroup', {
      userPoolId: this.userPool.userPoolId,
      groupName: 'admin'
    });

    // A Cognito User Pool Client
    this.userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
      userPool: this.userPool,
      generateSecret: false
    });

    // Output the Cognito User Pool Id
    new cdk.CfnOutput(this, 'UserPoolId', {
      value: this.userPool.userPoolId
    });

    // Output the Cognito User Pool Client Id
    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: this.userPoolClient.userPoolClientId
    });
  }
}
