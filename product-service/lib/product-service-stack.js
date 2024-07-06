const { Stack, Duration } = require('aws-cdk-lib');
const lambda = require('aws-cdk-lib/aws-lambda');
const apigateway = require('aws-cdk-lib/aws-apigateway');
const dynamodb = require('aws-cdk-lib/aws-dynamodb');
const sqs = require('aws-cdk-lib/aws-sqs');
const sns = require('aws-cdk-lib/aws-sns');
const subscriptions = require('aws-cdk-lib/aws-sns-subscriptions');
const eventSources = require('aws-cdk-lib/aws-lambda-event-sources');

class ProductServiceStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const productsTableName = 'products';
    const stocksTableName = 'stocks';

    const productsTable = dynamodb.Table.fromTableName(this, 'ProductsTable', productsTableName);
    const stocksTable = dynamodb.Table.fromTableName(this, 'StocksTable', stocksTableName);

    const catalogItemsQueue = new sqs.Queue(this, 'CatalogItemsQueue', {
      queueName: 'CatalogItemsQueue',
      visibilityTimeout: Duration.seconds(30),
      receiveMessageWaitTimeSeconds: 20,
    });

    const createProductTopic = new sns.Topic(this, 'CreateProductTopic', {
      topicName: 'CreateProductTopic',
    });

    // Add email subscription to the SNS topic
    createProductTopic.addSubscription(new subscriptions.EmailSubscription('krystinabutko@gmail.com'));

    createProductTopic.addSubscription(new subscriptions.EmailSubscription('christinaasipenka@gmail.com', {
      filterPolicy: {
        price: sns.SubscriptionFilter.numericFilter({
          between: { start: 0, stop: 100 }
        })
      }
    }));

    const catalogBatchProcess = new lambda.Function(this, 'catalogBatchProcess', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('product-service'),
      handler: 'catalog-batch-process.handler',
      environment: {
        PRODUCTS_TABLE: productsTable.tableName,
        STOCKS_TABLE: stocksTable.tableName,
        CREATE_PRODUCT_TOPIC_ARN: createProductTopic.topicArn,
      },
    });

    // Grant the necessary permissions to the Lambda function
    productsTable.grantReadWriteData(catalogBatchProcess);
    stocksTable.grantReadWriteData(catalogBatchProcess);
    catalogItemsQueue.grantConsumeMessages(catalogBatchProcess);
    createProductTopic.grantPublish(catalogBatchProcess);

    // Add SQS event source to the Lambda function
    const eventSource = new eventSources.SqsEventSource(catalogItemsQueue, {
      batchSize: 5,
    });
    catalogBatchProcess.addEventSource(eventSource);

    // Other Lambda functions and API Gateway setup
    const getProductsList = new lambda.Function(this, 'getProductsList', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('product-service'),
      handler: 'get-products.handler',
      environment: {
        PRODUCTS_TABLE: productsTable.tableName,
        STOCKS_TABLE: stocksTable.tableName,
      },
    });

    const getProduct = new lambda.Function(this, 'getProduct', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('product-service'),
      handler: 'get-product.handler',
      environment: {
        PRODUCTS_TABLE: productsTable.tableName,
        STOCKS_TABLE: stocksTable.tableName,
      },
    });

    const createProduct = new lambda.Function(this, 'createProduct', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('product-service'),
      handler: 'create-product.handler',
      environment: {
        PRODUCTS_TABLE: productsTable.tableName,
        STOCKS_TABLE: stocksTable.tableName,
      },
    });

    productsTable.grantReadWriteData(getProductsList);
    productsTable.grantReadWriteData(getProduct);
    productsTable.grantReadWriteData(createProduct);

    const api = new apigateway.RestApi(this, 'ProductServiceApi', {
      deployOptions: {
        stageName: 'prod',
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: ['GET', 'POST', 'OPTIONS'],
      },
    });

    const productsResource = api.root.addResource('products');
    productsResource.addMethod('GET', new apigateway.LambdaIntegration(getProductsList));
    productsResource.addMethod('POST', new apigateway.LambdaIntegration(createProduct));

    const productResource = api.root.addResource('product');
    const productIdResource = productResource.addResource('{id}');
    productIdResource.addMethod('GET', new apigateway.LambdaIntegration(getProduct));
  }
}

module.exports = { ProductServiceStack };
