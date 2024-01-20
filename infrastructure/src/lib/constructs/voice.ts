import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import path = require('path');

export class VoiceConstruct extends Construct {
  readonly voiceLambda: NodejsFunction;

  constructor(scope: Construct, id: string, _props?: cdk.StackProps) {
    super(scope, id);

    // S3 bucket for storing audio files
    const s3Bucket = new s3.Bucket(this, 'S3Bucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      lifecycleRules: [
        {
          expiration: cdk.Duration.days(1)
        }
      ]
    });

    // Create azure speech secret with region and key.
    const speechSecret = new secretsmanager.Secret(this, 'AzureSpeechSecret', {
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ region: 'value', key: 'value' }),
        generateStringKey: 'key'
      }
    });

    // Voice Lambda
    this.voiceLambda = new NodejsFunction(this, 'VoiceLambda', {
      runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, '../assets/lambdas/voice/index.ts'),
      environment: {
        S3_BUCKET: s3Bucket.bucketName,
        AZURE_SPEECH_SECRET: speechSecret.secretArn
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

    // Grants the lambda permission to get the Azure speech secret.
    speechSecret.grantRead(this.voiceLambda);

    // Grants the lambda permission to write/read to/from the S3 bucket.
    s3Bucket.grantReadWrite(this.voiceLambda);
  }
}
