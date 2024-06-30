const cdk = require('aws-cdk-lib');
const lambda = require('aws-cdk-lib/aws-lambda');
const apigateway = require('aws-cdk-lib/aws-apigateway');
const s3 = require('aws-cdk-lib/aws-s3');
//const { Construct } = require('constructs');

class ImportServiceStack extends cdk.Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    const bucket = s3.Bucket.fromBucketName(this, 'ExistingBucket', 'aws-course-upload-bucket-ca');

    const importProductsFunction = new lambda.Function(this, 'importProductsFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'importProductsFile.handler',
      code: lambda.Code.fromAsset('import-service'),
      environment: {
        BUCKET_NAME: bucket.bucketName,
      },
    });

    bucket.grantReadWrite(importProductsFunction);

    const api = new apigateway.RestApi(this, 'importProductsApi', {
      restApiName: 'Import Products Service',
      description: 'This service imports products.',
    });

    const importIntegration = new apigateway.LambdaIntegration(importProductsFunction);

    api.root.addResource('import').addMethod('GET', importIntegration);

    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: api.url,
    });
  }
}

module.exports = { ImportServiceStack };
