import { Stage } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ApplicationStageProps } from 'lib/types/application';
import { BackendStack } from '../stacks/backend-stack';
import { FrontendStack } from '../stacks/frontend-stack';

/**
 * The application stage is responsible for deploying the entire application.
 * @param scope The construct to attach the stage to.
 * @param id The ID of the stage.
 * @param props The stage properties.
 * @returns The application stage.
 */
export class ApplicationStage extends Stage {
  constructor(scope: Construct, id: string, props: ApplicationStageProps) {
    super(scope, id, props);

    // The frontend stack is what is reasponsible for hosting our React web
    // application via a CloudFront distribution and S3 bucket. If we have a
    // certificate, we will use it to setup a custom domain name for the
    // CloudFront distribution.
    new FrontendStack(this, 'Frontend', props.frontend);

    // The backend stack is responsible for all of the backend resources, such
    // as the AppSync API, Cognito User Pool, DynamoDB table, SQS queue, and
    // all of our Lambda functions.
    new BackendStack(this, 'Backend', props.backend);
  }
}
