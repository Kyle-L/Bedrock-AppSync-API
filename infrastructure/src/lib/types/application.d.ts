import { RemovalPolicy, StackProps, StageProps } from 'aws-cdk-lib';

export interface ApplicationProps {
  frontend: FrontendProps;
  backend: BackendProps;
}

export interface FrontendProps {
  customDomain?: {
    /**
     * The ARN of the ACM certificate to use for the custom domain.
     * @default - No custom domain.
     */
    acmCertificateArn: string;

    /**
     * The custom domain name to use for the CloudFront distribution.
     * @default - No custom domain.
     */
    domain: string;
  };
}

export interface BackendProps {
  apiCustomDomain?: {
    /**
     * The ARN of the ACM certificate to use for the API.
     * @default - No custom domain.
     */
    acmCertificateArn: string;

    /**
     * The custom domain name to use for the API.
     * @default - No custom domain.
     */
    domain: string;
  };

  pinecone?: {
    /**
     * The Pinecone connection string. Pinecone is used to store the knowledge base,
     * a vector database.
     */
    connectionString: string;

    /**
     * The Pinecone secret ARN. Pinecone is used to store the knowledge base,
     * a vector database.
     */
    secretArn: string;
  };

  /**
   * The Azure Cognitive Services Text-to-Speech secret ARN.
   */
  speechSecretArn?: string;
}

export type FrontendStackProps = StackProps & FrontendProps;
export type BackendStackProps = StackProps & BackendProps;
export type ApplicationStageProps = StageProps & ApplicationProps;
