import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import { Construct } from 'constructs';
import path = require('path');

export interface AppSyncConstructProps {
  customDomain?: cdk.aws_appsync.DomainOptions;
  userPool: cognito.UserPool;
  userPoolClient: cognito.UserPoolClient;
}

export class ApiConstruct extends Construct {
  public readonly appsync: appsync.GraphqlApi;

  constructor(scope: Construct, id: string, props: AppSyncConstructProps) {
    super(scope, id);

    const { customDomain: domainName, userPool, userPoolClient } = props;

    // Create an AppSync GraphQL API
    this.appsync = new appsync.GraphqlApi(this, 'AppSyncApi', {
      name: 'GenAIApi',
      definition: appsync.Definition.fromFile(
        path.join(__dirname, '../graphql/schema.graphql')
      ),
      domainName,
      xrayEnabled: true,
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.USER_POOL,
          userPoolConfig: {
            userPool,
            appIdClientRegex: userPoolClient.userPoolClientId
          }
        },
        additionalAuthorizationModes: [
          {
            authorizationType: appsync.AuthorizationType.IAM
          }
        ]
      }
    });

    // Output the API Gateway endpoint URL
    new cdk.CfnOutput(this, 'GraphQLAPIURL', {
      value: this.appsync.graphqlUrl
    });
  }
}
