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
import * as acm from 'aws-cdk-lib/aws-certificatemanager';

interface BackendStackProps extends cdk.StackProps {
  domains?: string[];
  acmCertificateArn?: string;
  removalPolicy?: cdk.RemovalPolicy;
}

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: BackendStackProps) {
    super(scope, id, props);

    // An ACM certificate for the custom domain.
    let certificate: acm.ICertificate | undefined;
    if (props?.acmCertificateArn) {
      certificate = acm.Certificate.fromCertificateArn(
        this,
        'Certificate',
        props.acmCertificateArn
      );
    }

    // A Cognito User Pool
    const cognito = new AuthConstruct(this, 'Auth', {
      userPoolDomainPrefix: 'gen-ai-appsync',
      removalPolicy: props?.removalPolicy
    });

    // API Gateway
    const api = new ApiConstruct(this, 'Api', {
      userPool: cognito.userPool,
      userPoolClient: cognito.userPoolClient
    });

    // DynamoDB Table
    const conversationHistory = new ConversationHistoryConstruct(this, 'ConversationHistory', {
      removalPolicy: props?.removalPolicy
    });

    const predict = new PredictConstruct(this, 'Predict', {
      appSyncApi: api.appsync,
      conversationHistoryTable: conversationHistory.table
    });

    /*================================= Data Sources =================================*/

    const predictAsyncDataSource = api.appsync.addLambdaDataSource(
      'PredictAsyncDataSource',
      predict.queueLambda
    );

    const conversationHistoryDataSource = api.appsync.addDynamoDbDataSource(
      'ConversationHistoryDataSource',
      conversationHistory.table
    );

    const noneDataSource = api.appsync.addNoneDataSource('NoneDataSource');

    // Code
    const passthrough = appsync.Code.fromAsset(
      path.join(__dirname, '../resolvers/pass-through.js')
    );

    const receiveAsync = appsync.Code.fromAsset(
      path.join(__dirname, '../resolvers/recieve-async.js')
    );

    /*================================= Functions =================================*/

    const getPersonaFunc = new appsync.AppsyncFunction(this, 'getPersona', {
      name: 'getPersona',
      api: api.appsync,
      dataSource: conversationHistoryDataSource,
      code: appsync.Code.fromAsset(path.join(__dirname, '../resolvers/get-persona.js')),
      runtime: appsync.FunctionRuntime.JS_1_0_0
    });

    const getAllPersonasFunc = new appsync.AppsyncFunction(this, 'getAllPersonas', {
      name: 'getAllPersonas',
      api: api.appsync,
      dataSource: conversationHistoryDataSource,
      code: appsync.Code.fromAsset(path.join(__dirname, '../resolvers/get-personas.js')),
      runtime: appsync.FunctionRuntime.JS_1_0_0
    });

    const getThreadFunc = new appsync.AppsyncFunction(this, 'getThread', {
      name: 'getThread',
      api: api.appsync,
      dataSource: conversationHistoryDataSource,
      code: appsync.Code.fromAsset(path.join(__dirname, '../resolvers/get-thread.js')),
      runtime: appsync.FunctionRuntime.JS_1_0_0
    });

    const getAllThreadsFunc = new appsync.AppsyncFunction(this, 'getAllThreads', {
      name: 'getAllThreads',
      api: api.appsync,
      dataSource: conversationHistoryDataSource,
      code: appsync.Code.fromAsset(path.join(__dirname, '../resolvers/get-threads.js')),
      runtime: appsync.FunctionRuntime.JS_1_0_0
    });

    const addThreadFunc = new appsync.AppsyncFunction(this, 'addThread', {
      name: 'addThread',
      api: api.appsync,
      dataSource: conversationHistoryDataSource,
      code: appsync.Code.fromAsset(path.join(__dirname, '../resolvers/add-thread.js')),
      runtime: appsync.FunctionRuntime.JS_1_0_0
    });

    const deleteThread = new appsync.AppsyncFunction(this, 'deleteThread', {
      name: 'deleteThread',
      api: api.appsync,
      dataSource: conversationHistoryDataSource,
      code: appsync.Code.fromAsset(path.join(__dirname, '../resolvers/delete-thread.js')),
      runtime: appsync.FunctionRuntime.JS_1_0_0
    });

    const addMessageSystemFunc = new appsync.AppsyncFunction(this, 'addMessageSystem', {
      name: 'addMessageSystem',
      api: api.appsync,
      dataSource: conversationHistoryDataSource,
      code: appsync.Code.fromAsset(path.join(__dirname, '../resolvers/add-message.js')),
      runtime: appsync.FunctionRuntime.JS_1_0_0
    });

    const predictAsyncFunc = new appsync.AppsyncFunction(this, 'PredictAsync', {
      name: 'predictAsync',
      api: api.appsync,
      dataSource: predictAsyncDataSource
    });

    /*================================= Resolvers =================================*/

    new appsync.Resolver(this, 'getPersonaResolver', {
      api: api.appsync,
      typeName: 'Query',
      fieldName: 'getPersona',
      pipelineConfig: [getPersonaFunc],
      runtime: appsync.FunctionRuntime.JS_1_0_0,
      code: passthrough
    });

    new appsync.Resolver(this, 'getAllPersonasResolver', {
      api: api.appsync,
      typeName: 'Query',
      fieldName: 'getAllPersonas',
      pipelineConfig: [getAllPersonasFunc],
      runtime: appsync.FunctionRuntime.JS_1_0_0,
      code: passthrough
    });

    new appsync.Resolver(this, 'getThreadResolver', {
      api: api.appsync,
      typeName: 'Query',
      fieldName: 'getThread',
      pipelineConfig: [getThreadFunc],
      runtime: appsync.FunctionRuntime.JS_1_0_0,
      code: passthrough
    });

    new appsync.Resolver(this, 'getAllThreadsResolver', {
      api: api.appsync,
      typeName: 'Query',
      fieldName: 'getAllThreads',
      pipelineConfig: [getAllThreadsFunc],
      runtime: appsync.FunctionRuntime.JS_1_0_0,
      code: passthrough
    });

    new appsync.Resolver(this, 'addThreadResolver', {
      api: api.appsync,
      typeName: 'Mutation',
      fieldName: 'addThread',
      pipelineConfig: [getPersonaFunc, addThreadFunc],
      runtime: appsync.FunctionRuntime.JS_1_0_0,
      code: passthrough
    });

    new appsync.Resolver(this, 'deleteThreadResolver', {
      api: api.appsync,
      typeName: 'Mutation',
      fieldName: 'deleteThread',
      pipelineConfig: [deleteThread],
      runtime: appsync.FunctionRuntime.JS_1_0_0,
      code: passthrough
    });

    new appsync.Resolver(this, 'addMessageSystemResolver', {
      api: api.appsync,
      typeName: 'Mutation',
      fieldName: 'addMessageSystem',
      pipelineConfig: [addMessageSystemFunc],
      runtime: appsync.FunctionRuntime.JS_1_0_0,
      code: passthrough
    });

    new appsync.Resolver(this, 'MutationResolver', {
      api: api.appsync,
      typeName: 'Mutation',
      fieldName: 'addMessageAsync',
      pipelineConfig: [getThreadFunc, predictAsyncFunc],
      runtime: appsync.FunctionRuntime.JS_1_0_0,
      code: passthrough
    });

    noneDataSource.createResolver('sendMessageChunkResolver', {
      typeName: 'Mutation',
      fieldName: 'sendMessageChunk',
      requestMappingTemplate: appsync.MappingTemplate.fromString(`
        {
          "version": "2018-05-29",
          "payload": $util.toJson($context.arguments)
        }
      `),
      responseMappingTemplate: appsync.MappingTemplate.fromString(`
        $util.toJson($context.result)
      `)
    });

    noneDataSource.createResolver('recieveMessageChunkAsyncResolver', {
      typeName: 'Subscription',
      fieldName: 'recieveMessageChunkAsync',
      runtime: appsync.FunctionRuntime.JS_1_0_0,
      code: receiveAsync
    });
  }
}
