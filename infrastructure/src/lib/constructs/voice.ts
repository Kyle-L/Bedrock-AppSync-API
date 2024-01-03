import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import path = require('path');

export class VoiceConstruct extends Construct {
  readonly voiceLambda: NodejsFunction;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id);

    // S3 bucket for storing audio files
    const s3Bucket = new cdk.aws_s3.Bucket(this, 'S3Bucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      publicReadAccess: true
    });

    // Voice Lambda
    this.voiceLambda = new NodejsFunction(this, 'VoiceLambda', {
      runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, '../assets/lambdas/polly/index.ts'),
      environment: {
        S3_BUCKET: s3Bucket.bucketName
      },
      bundling: {
        minify: true,
        sourceMap: true
      },
      timeout: cdk.Duration.seconds(30),
      initialPolicy: [
        // Allow the lambda to call Polly
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['polly:*'],
          resources: [`*`]
        })
      ]
    });

    // Grants the lambda permission to write/read to/from the S3 bucket.
    s3Bucket.grantReadWrite(this.voiceLambda);
  }
}
