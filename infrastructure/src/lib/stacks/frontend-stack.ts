import * as cdk from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { FrontendStackProps } from 'lib/types/application';

/**
 * The frontend stack is responsible for the web application.
 */
export class FrontendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props);

    const { customDomain } = props;

    // An ACM certificate for the custom domain.
    let certificate: acm.ICertificate | undefined;
    if (customDomain) {
      certificate = acm.Certificate.fromCertificateArn(
        this,
        'Certificate',
        customDomain.acmCertificateArn
      );
    }

    // An S3 bucket to host the web application.
    const bucket = new s3.Bucket(this, 'Bucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    // A CloudFront distribution to serve the web application.
    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS
      },
      domainNames: customDomain ? [customDomain?.domain] : undefined,
      certificate: certificate,
      defaultRootObject: 'index.html',

      // Redirect all 404 errors to the index.html page.
      // This is required for single page applications.
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html'
        },
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html'
        }
      ]
    });

    // Export the CloudFront distribution URL.
    new cdk.CfnOutput(this, 'DistributionUrl', {
      value: distribution.distributionDomainName
    });

    // Export the bucket name.
    new cdk.CfnOutput(this, 'BucketName', {
      value: bucket.bucketName
    });
  }
}
