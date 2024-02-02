import { ApplicationStageProps } from './lib/types/application';

export const config: ApplicationStageProps = {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  },
  frontend: {
    customDomain: {
      acmCertificateArn:
        'arn:aws:acm:us-east-1:248134257233:certificate/867d061c-669c-4147-abb2-dd8658ff3817',
      domain: 'behavior.kylelierer.com'
    }
  },
  backend: {
    customDomain: {
      acmCertificateArn:
        'arn:aws:acm:us-east-1:248134257233:certificate/867d061c-669c-4147-abb2-dd8658ff3817',
      domain: 'api.behavior.kylelierer.com'
    },
    pinecone: {
      connectionString: 'https://bedrock-698x9ew.svc.gcp-starter.pinecone.io',
      secretArn:
        'arn:aws:secretsmanager:us-east-1:248134257233:secret:GenAI/Backend/Pinecone-kBK9L6'
    },
    speechSecretArn:
      'arn:aws:secretsmanager:us-east-1:248134257233:secret:GenAI/Backend/AzureTTS-jWNmLI'
  }
};
