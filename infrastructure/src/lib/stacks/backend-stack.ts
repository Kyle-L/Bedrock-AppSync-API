import * as cdk from 'aws-cdk-lib';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import { Construct } from 'constructs';
import { BackendStackProps } from 'lib/types/application';
import * as path from 'path';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import {
  ApiConstruct,
  AuthConstruct,
  ConversationHistoryConstruct,
  PredictConstruct
} from '../constructs';
import { KnowledgeBaseConstruct } from '../constructs/knowledge-base';

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: BackendStackProps) {
    super(scope, id, props);

    const { customDomain, pinecone, removalPolicy, speechSecretArn } = props;

    // An ACM certificate for the custom domain.
    let certificate: acm.ICertificate | undefined;
    if (customDomain) {
      certificate = acm.Certificate.fromCertificateArn(
        this,
        'Certificate',
        customDomain.acmCertificateArn
      );
    }

    // Cognito User Pool
    const authConstruct = new AuthConstruct(this, 'Auth', {
      customDomain:
        customDomain && certificate
          ? {
                domainName: customDomain.domain,
                certificate
            }
          : undefined,
    });

    // API handled by AppSync
    const apiConstruct = new ApiConstruct(this, 'Api', {
      customDomain:
        customDomain && certificate
          ? {
              domainName: customDomain.domain,
              certificate
            }
          : undefined,
      userPool: authConstruct.userPool,
      userPoolClient: authConstruct.userPoolClient
    });

    // Knowledge Base - Handles integration with Pinecone
    let knowledgeBase: KnowledgeBaseConstruct | undefined;
    if (pinecone) {
      knowledgeBase = new KnowledgeBaseConstruct(this, 'KnowledgeBase', {
        pineconeConnectionString: pinecone.connectionString,
        pineConeSecretArn: pinecone.secretArn
      });
    }

    // DynamoDB Table - Stores personas and conversation threads/messages.
    const conversationHistoryConstruct = new ConversationHistoryConstruct(
      this,
      'ConversationHistory',
      {
        removalPolicy: removalPolicy,
        knowledgeBaseId: knowledgeBase?.knowledgeBase?.knowledgeBaseId
      }
    );

    // Prediction lambdas - Handles integration with Bedrock.
    const predictConstruct = new PredictConstruct(this, 'Predict', {
      api: apiConstruct.appsync,
      table: conversationHistoryConstruct.table,
      bucket: conversationHistoryConstruct.bucket,
      speechSecretArn
    });

    /*================================= Data Sources =================================*/

    // Lambda Data Sources
    const predictAsyncDataSource = apiConstruct.appsync.addLambdaDataSource(
      'PredictAsyncDataSource',
      predictConstruct.queueLambda
    );
    const getVoiceDataSource = apiConstruct.appsync.addLambdaDataSource(
      'GetVoiceDataSource',
      predictConstruct.voiceLambda
    );

    // DynamoDB Data Sources
    const conversationHistoryDataSource =
      apiConstruct.appsync.addDynamoDbDataSource(
        'ConversationHistoryDataSource',
        conversationHistoryConstruct.table
      );

    // None Data Sources
    const noneDataSource =
      apiConstruct.appsync.addNoneDataSource('NoneDataSource');

    /*================================= Generic Functions =================================*/
    // These are used to create the resolver functions.

    // Pass Through Code - Used when no custom code is needed.
    // This is necessary for some pipelines resolvers where the first step is a lambda function.
    const passThroughCode = appsync.Code.fromAsset(
      path.join(__dirname, '../resolvers/util/pass-through.js')
    );

    // Input Pass Through Code - Same as passThroughCode, but specifically passes only the input
    // property to the payload. This is useful for subscriptions where the input is the only thing
    // that needs to be passed through.
    const payloadPassThroughCode = appsync.Code.fromAsset(
      path.join(__dirname, '../resolvers/util/input-pass-through.js')
    );

    /*================================= Functions =================================*/
    // These are the resolver functions that are type and field specific. e.g., createPersona, getThread, etc.

    const createResolverFunction = (
      name: string,
      dataSource: cdk.aws_appsync.DynamoDbDataSource | appsync.LambdaDataSource,
      codePath: string,
      runtime = appsync.FunctionRuntime.JS_1_0_0
    ) => {
      return new appsync.AppsyncFunction(this, name, {
        name,
        api: apiConstruct.appsync,
        dataSource,
        code: appsync.Code.fromAsset(path.join(__dirname, codePath)),
        runtime
      });
    };

    const createLambdaFunction = (
      name: string,
      dataSource: cdk.aws_appsync.DynamoDbDataSource | appsync.LambdaDataSource
    ) => {
      return new appsync.AppsyncFunction(this, name, {
        name,
        api: apiConstruct.appsync,
        dataSource
      });
    };

    // Personas
    const createPersonaFunction = createResolverFunction(
      'createPersona',
      conversationHistoryDataSource,
      '../resolvers/personas/create-persona.js'
    );
    const updatePersonaFunction = createResolverFunction(
      'updatePersona',
      conversationHistoryDataSource,
      '../resolvers/personas/update-persona.js'
    );
    const deletePersonaFunction = createResolverFunction(
      'deletePersona',
      conversationHistoryDataSource,
      '../resolvers/personas/delete-persona.js'
    );
    const getPersonaFunction = createResolverFunction(
      'getPersona',
      conversationHistoryDataSource,
      '../resolvers/personas/get-persona.js'
    );
    const getAllPersonasFunction = createResolverFunction(
      'getAllPersonas',
      conversationHistoryDataSource,
      '../resolvers/personas/get-personas.js'
    );

    // Threads

    const createThreadFunction = createResolverFunction(
      'createThread',
      conversationHistoryDataSource,
      '../resolvers/threads/create-thread.js'
    );
    const deleteThreadFunction = createResolverFunction(
      'deleteThread',
      conversationHistoryDataSource,
      '../resolvers/threads/delete-thread.js'
    );
    const getThreadFunction = createResolverFunction(
      'getThread',
      conversationHistoryDataSource,
      '../resolvers/threads/get-thread.js'
    );
    const getAllThreadsFunction = createResolverFunction(
      'getAllThreads',
      conversationHistoryDataSource,
      '../resolvers/threads/get-threads.js'
    );
    const threadSubscriptionFilter = appsync.Code.fromAsset(
      path.join(__dirname, '../resolvers/threads/thread-filter.js')
    );

    // Messages

    const systemCreateMessageFunction = createResolverFunction(
      'systemCreateMessage',
      conversationHistoryDataSource,
      '../resolvers/messages/create-message.js'
    );

    // Predict

    const predictAsyncFunction = createLambdaFunction(
      'PredictAsync',
      predictAsyncDataSource
    );

    // Voice

    const getVoiceFunction = createLambdaFunction(
      'getVoice',
      getVoiceDataSource
    );

    /*================================= Resolvers =================================*/

    const resolverConfigs = [
      // Personas
      {
        typeName: 'Mutation',
        fieldName: 'createPersona',
        pipelineConfig: [createPersonaFunction]
      },
      {
        typeName: 'Mutation',
        fieldName: 'updatePersona',
        pipelineConfig: [updatePersonaFunction]
      },
      {
        typeName: 'Mutation',
        fieldName: 'deletePersona',
        pipelineConfig: [deletePersonaFunction]
      },
      {
        typeName: 'Query',
        fieldName: 'getPersona',
        pipelineConfig: [getPersonaFunction]
      },
      {
        typeName: 'Query',
        fieldName: 'getAllPersonas',
        pipelineConfig: [getAllPersonasFunction]
      },

      // Threads
      {
        typeName: 'Query',
        fieldName: 'getThread',
        pipelineConfig: [getThreadFunction]
      },
      {
        typeName: 'Query',
        fieldName: 'getAllThreads',
        pipelineConfig: [getAllThreadsFunction]
      },
      {
        typeName: 'Mutation',
        fieldName: 'createThread',
        pipelineConfig: [getPersonaFunction, createThreadFunction]
      },
      {
        typeName: 'Mutation',
        fieldName: 'deleteThread',
        pipelineConfig: [deleteThreadFunction]
      },

      // Messages
      {
        typeName: 'Mutation',
        fieldName: 'systemCreateMessage',
        pipelineConfig: [systemCreateMessageFunction]
      },
      {
        typeName: 'Mutation',
        fieldName: 'createMessageAsync',
        pipelineConfig: [getThreadFunction, predictAsyncFunction]
      },

      // Voice
      {
        typeName: 'Mutation',
        fieldName: 'createVoice',
        pipelineConfig: [getThreadFunction, getVoiceFunction]
      },

      // System
      {
        typeName: 'Mutation',
        fieldName: 'systemSendMessageChunk',
        runtime: appsync.FunctionRuntime.JS_1_0_0,
        code: payloadPassThroughCode,
        dataSource: noneDataSource
      },
      {
        typeName: 'Subscription',
        fieldName: 'recieveMessageChunkAsync',
        runtime: appsync.FunctionRuntime.JS_1_0_0,
        code: threadSubscriptionFilter,
        dataSource: noneDataSource
      }
    ];

    resolverConfigs.forEach((config) => {
      new appsync.Resolver(
        this,
        `${config.typeName}${config.fieldName}Resolver`,
        {
          api: apiConstruct.appsync,
          typeName: config.typeName,
          fieldName: config.fieldName,
          pipelineConfig: config.pipelineConfig,
          runtime: appsync.FunctionRuntime.JS_1_0_0,
          code: config.code || passThroughCode,
          dataSource: config.dataSource
        }
      );
    });
  }
}
