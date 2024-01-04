import * as cdk from 'aws-cdk-lib';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import { Construct } from 'constructs';
import * as path from 'path';
import {
  ApiConstruct,
  AuthConstruct,
  ConversationHistoryConstruct,
  PredictConstruct,
  VoiceConstruct
} from '../constructs';

interface BackendStackProps extends cdk.StackProps {
  domains?: string[];
  acmCertificateArn?: string;
  removalPolicy?: cdk.RemovalPolicy;
}

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: BackendStackProps) {
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

    // DynamoDB Table
    const conversationHistoryConstruct = new ConversationHistoryConstruct(this, 'ConversationHistory', {
      removalPolicy: props?.removalPolicy
    });

    // Prediction lambdas
    const predictConstruct = new PredictConstruct(this, 'Predict', {
      appSyncApi: apiConstruct.appsync,
      conversationHistoryTable: conversationHistoryConstruct.table
    });

    // WIP - Voice Lambda
    const voiceConstruct = new VoiceConstruct(this, 'Voice');

    /*================================= Data Sources =================================*/

    // Lambda Data Sources
    const predictAsyncDataSource = apiConstruct.appsync.addLambdaDataSource(
      'PredictAsyncDataSource',
      predictConstruct.queueLambda
    );
    const getVoiceDataSource = apiConstruct.appsync.addLambdaDataSource(
      'GetVoiceDataSource',
      voiceConstruct.voiceLambda
    );

    // DynamoDB Data Sources
    const conversationHistoryDataSource = apiConstruct.appsync.addDynamoDbDataSource(
      'ConversationHistoryDataSource',
      conversationHistoryConstruct.table
    );

    // None Data Sources
    const noneDataSource = apiConstruct.appsync.addNoneDataSource('NoneDataSource');

    // Code
    const passthroughCode = appsync.Code.fromAsset(path.join(__dirname, '../resolvers/pass-through.js'));
    const noneCode = appsync.Code.fromAsset(path.join(__dirname, '../resolvers/none.js'));
    const recieveAsyncCode = appsync.Code.fromAsset(path.join(__dirname, '../resolvers/recieve-async.js'));

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

    const getPersonaFunction = createResolverFunction(
      'getPersona',
      conversationHistoryDataSource,
      '../resolvers/get-persona.js'
    );
    const getAllPersonasFunction = createResolverFunction(
      'getAllPersonas',
      conversationHistoryDataSource,
      '../resolvers/get-personas.js'
    );
    const getThreadFunction = createResolverFunction(
      'getThread',
      conversationHistoryDataSource,
      '../resolvers/get-thread.js'
    );
    const getAllThreadsFunction = createResolverFunction(
      'getAllThreads',
      conversationHistoryDataSource,
      '../resolvers/get-threads.js'
    );
    const addThreadFunction = createResolverFunction(
      'addThread',
      conversationHistoryDataSource,
      '../resolvers/add-thread.js'
    );
    const deleteThreadFunction = createResolverFunction(
      'deleteThread',
      conversationHistoryDataSource,
      '../resolvers/delete-thread.js'
    );
    const addMessageSystemFunction = createResolverFunction(
      'addMessageSystem',
      conversationHistoryDataSource,
      '../resolvers/add-message.js'
    );
    const predictAsyncFunction = createLambdaFunction('PredictAsync', predictAsyncDataSource);
    const getVoiceFunction = createLambdaFunction('getVoice', getVoiceDataSource);

    /*================================= Resolvers =================================*/

    const resolverConfigs = [
      { typeName: 'Query', fieldName: 'getPersona', pipelineConfig: [getPersonaFunction] },
      { typeName: 'Query', fieldName: 'getAllPersonas', pipelineConfig: [getAllPersonasFunction] },
      { typeName: 'Query', fieldName: 'getThread', pipelineConfig: [getThreadFunction] },
      { typeName: 'Query', fieldName: 'getAllThreads', pipelineConfig: [getAllThreadsFunction] },
      { typeName: 'Mutation', fieldName: 'addThread', pipelineConfig: [getPersonaFunction, addThreadFunction] },
      { typeName: 'Mutation', fieldName: 'deleteThread', pipelineConfig: [deleteThreadFunction] },
      { typeName: 'Mutation', fieldName: 'addMessageSystem', pipelineConfig: [addMessageSystemFunction] },
      { typeName: 'Mutation', fieldName: 'addMessageAsync', pipelineConfig: [getThreadFunction, predictAsyncFunction] },
      { typeName: 'Mutation', fieldName: 'addVoice', pipelineConfig: [getPersonaFunction, getVoiceFunction] },
      {
        typeName: 'Mutation',
        fieldName: 'sendMessageChunk',
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
      new appsync.Resolver(this, `${config.typeName}${config.fieldName}Resolver`, {
        api: apiConstruct.appsync,
        typeName: config.typeName,
        fieldName: config.fieldName,
        pipelineConfig: config.pipelineConfig,
        runtime: appsync.FunctionRuntime.JS_1_0_0,
        code: config.code || passthroughCode,
        dataSource: config.dataSource
      });
    });
  }
}
