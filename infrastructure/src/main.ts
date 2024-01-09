import { App } from 'aws-cdk-lib';
import { ApplicationStage } from './lib/stages/application-stage';

const app = new App();

new ApplicationStage(app, 'GenAI', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  },
  acmCertificateArn: 'arn:aws:acm:us-east-1:248134257233:certificate/d8ff1d7a-934f-4859-993d-e818abc24ff6',
  domains: ['appsync-bedrock.kylelierer.com'],
  pineconeConnectionString: 'https://bedrock-6t6y3va.svc.gcp-starter.pinecone.io'
});

app.synth();
