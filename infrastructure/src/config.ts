import { ApplicationStageProps } from './lib/types/application';

const { env } = process;

export const config: ApplicationStageProps = {
  env: {
    account: env.CDK_DEFAULT_ACCOUNT,
    region: env.CDK_DEFAULT_REGION
  },
  frontend: {
    customDomain:
      env.FRONTEND_ACM_CERTIFICATE_ARN && env.FRONTEND_DOMAIN
        ? {
            acmCertificateArn: env.FRONTEND_ACM_CERTIFICATE_ARN,
            domain: env.FRONTEND_DOMAIN
          }
        : undefined
  },
  backend: {
    apiCustomDomain:
      env.BACKEND_API_ACM_CERTIFICATE_ARN && env.BACKEND_API_DOMAIN
        ? {
            acmCertificateArn: env.BACKEND_API_ACM_CERTIFICATE_ARN,
            domain: env.BACKEND_API_DOMAIN
          }
        : undefined,
    pinecone:
      env.PINECONE_CONNECTION_STRING && env.PINECONE_SECRET_ARN
        ? {
            connectionString: env.PINECONE_CONNECTION_STRING,
            secretArn: env.PINECONE_SECRET_ARN
          }
        : undefined,
    speechSecretArn: env.SPEECH_SECRET_ARN
  }
};
