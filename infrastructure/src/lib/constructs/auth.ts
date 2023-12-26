import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';

export interface CognitoConstructProps {
  userPoolDomainPrefix: string;
  removalPolicy?: cdk.RemovalPolicy;
}

export class AuthConstruct extends Construct {
  readonly userPool: cognito.UserPool;
  readonly userPoolClient: cognito.UserPoolClient;
  readonly userPoolDomain: cognito.UserPoolDomain;
  readonly presignupLambda: NodejsFunction;

  constructor(scope: Construct, id: string, props: CognitoConstructProps) {
    super(scope, id);

    // Pre-signup Lambda
    this.presignupLambda = new NodejsFunction(this, 'PreSignupLambda', {
      runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, '../assets/lambdas/pre-signup/index.ts'),
      bundling: {
        minify: true,
        sourceMap: true
      },
      timeout: cdk.Duration.seconds(30)
    });

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
      },
      lambdaTriggers: {
        preSignUp: this.presignupLambda
      },
      removalPolicy: props.removalPolicy
    });

    // A Cognito User Pool Client
    this.userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
      userPool: this.userPool,
      generateSecret: false
    });

    // A Cognito User Pool Domain
    this.userPoolDomain = new cognito.UserPoolDomain(this, 'UserPoolDomain', {
      userPool: this.userPool,
      cognitoDomain: {
        domainPrefix: props.userPoolDomainPrefix
      }
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
