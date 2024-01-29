import * as cdk from 'aws-cdk-lib';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import { Construct } from 'constructs';
import * as path from 'path';
import {
  ApiConstruct,
  AuthConstruct,
  ConversationHistoryConstruct,
  PredictConstruct
} from '../constructs';
import { KnowledgeBaseConstruct } from '../constructs/knowledge-base';

interface BackendStackProps extends cdk.StackProps {
  domains?: string[];

  pinecone?: {
    connectionString: string;
    secretArn: string;
  };

  azureCognitiveServicesTTSSecretArn?: string;
  acmCertificateArn?: string;
  removalPolicy?: cdk.RemovalPolicy;
}

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: BackendStackProps) {
    super(scope, id, props);

    // Cognito User Pool
    const authConstruct = new AuthConstruct(this, 'Auth', {
      userPoolDomainPrefix: 'gen-ai-appsync',
      removalPolicy: props?.removalPolicy
    });

    // API Gateway
    const apiConstruct = new ApiConstruct(this, 'Api', {
      userPool: authConstruct.userPool,
      userPoolClient: authConstruct.userPoolClient
    });

    // Knowledge Base - Handles integration with Pinecone
    let knowledgeBase: KnowledgeBaseConstruct | undefined;
    if (props.pinecone) {
      knowledgeBase = new KnowledgeBaseConstruct(this, 'KnowledgeBase', {
        pineconeConnectionString: props.pinecone.connectionString,
        pineConeSecretArn: props.pinecone.secretArn
      });
    }

    // DynamoDB Table - Stores personas and conversation threads/messages.
    const conversationHistoryConstruct = new ConversationHistoryConstruct(
      this,
      'ConversationHistory',
      {
        removalPolicy: props?.removalPolicy,
        knowledgeBaseId: knowledgeBase?.knowledgeBase?.knowledgeBaseId
      }
    );

    // Prediction lambdas - Handles integration with Bedrock.
    const predictConstruct = new PredictConstruct(this, 'Predict', {
      api: apiConstruct.appsync,
      table: conversationHistoryConstruct.table,
      bucket: conversationHistoryConstruct.bucket,
      azureCognitiveServicesTTSSecretArn:
        props.azureCognitiveServicesTTSSecretArn
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

    // Code
    const passthroughCode = appsync.Code.fromAsset(
      path.join(__dirname, '../resolvers/pass-through.js')
    );
    const noneCode = appsync.Code.fromAsset(
      path.join(__dirname, '../resolvers/none.js')
    );
    const recieveAsyncCode = appsync.Code.fromAsset(
      path.join(__dirname, '../resolvers/recieve-async.js')
    );

    /*================================= Functions =================================*/

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
        code: noneCode,
        dataSource: noneDataSource
      },
      {
        typeName: 'Subscription',
        fieldName: 'recieveMessageChunkAsync',
        runtime: appsync.FunctionRuntime.JS_1_0_0,
        code: recieveAsyncCode,
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
          code: config.code || passthroughCode,
          dataSource: config.dataSource
        }
      );
    });
  }
}
