const { Stack } = require("aws-cdk-lib");
const { aws_s3, aws_sqs } = require("aws-cdk-lib");
const { Cors, LambdaIntegration, RestApi } = require("aws-cdk-lib/aws-apigateway");
const lambda = require("aws-cdk-lib/aws-lambda");
const { Runtime } = require("aws-cdk-lib/aws-lambda");
const { NodejsFunction } = require("aws-cdk-lib/aws-lambda-nodejs");
const { LambdaDestination } = require("aws-cdk-lib/aws-s3-notifications");

class ImportServiceStack extends Stack {
    constructor(scope, id, props) {
        super(scope, id, props);

        const bucketName = "aws-course-upload-bucket-ca";

        const bucket = aws_s3.Bucket.fromBucketName(
            this,
            "ImportServiceBucket",
            bucketName
        );

        const queue = aws_sqs.Queue.fromQueueArn(
            this,
            'CatalogItemsQueue',
            `arn:aws:sqs:eu-west-1:590183943268:CatalogItemsQueue`
        );

        const api = new RestApi(this, "ImportProductsRestAPI", {
            restApiName: "ImportProductsRestAPI",
            deployOptions: {
                stageName: 'prod',
            },
            defaultCorsPreflightOptions: {
                allowOrigins: Cors.ALL_ORIGINS,
                allowMethods: Cors.ALL_METHODS,
                allowHeaders: [
                    "Content-Type",
                    "X-Amz-Date",
                    "Authorization",
                    "X-Api-Key",
                    "X-Amz-Security-Token",
                ],
            },
        });

        const importProductsLambda = new NodejsFunction(
            this,
            "ImportProductsLambda",
            {
                runtime: Runtime.NODEJS_20_X,
                code: lambda.Code.fromAsset("import-service"),
                handler: "importProductsFile.handler",
                environment: {
                    BUCKET_NAME: bucket.bucketName,
                },
            }
        );

        const parseProductsLambda = new NodejsFunction(
            this,
            "ParseProductsLambda",
            {
                runtime: Runtime.NODEJS_20_X,
                code: lambda.Code.fromAsset("import-service"),
                handler: "importFileParser.handler",
                environment: {
                    BUCKET_NAME: bucket.bucketName,
                    CATALOG_ITEMS_QUEUE_URL: queue.queueUrl,
                },
            }
        );

        bucket.grantPut(importProductsLambda);
        bucket.grantRead(parseProductsLambda);
        bucket.grantDelete(parseProductsLambda);

        queue.grantSendMessages(parseProductsLambda);

        const importProductsResource = api.root.addResource("import");

        const importProductsIntegration = new LambdaIntegration(
            importProductsLambda
        );

        importProductsResource.addMethod("GET", importProductsIntegration);

        const notification = new LambdaDestination(parseProductsLambda);
        bucket.addEventNotification(aws_s3.EventType.OBJECT_CREATED, notification, {
            prefix: "uploaded/",
            suffix: ".csv",
        });
    }
}

module.exports = { ImportServiceStack };
