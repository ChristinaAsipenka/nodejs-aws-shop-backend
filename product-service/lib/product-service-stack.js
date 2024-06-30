const { Stack, Duration, CfnOutput } = require('aws-cdk-lib');
const lambda = require('aws-cdk-lib/aws-lambda');
const apigateway = require('aws-cdk-lib/aws-apigateway');
const dynamodb = require('aws-cdk-lib/aws-dynamodb');

class ProductServiceStack extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    const productsTableName = 'products';
    const stocksTableName = 'stocks';

    // Import the existing DynamoDB table
    const productsTable = dynamodb.Table.fromTableName(this, 'ProductsTable', productsTableName);
    const stocksTable = dynamodb.Table.fromTableName(this, 'StocksTable', stocksTableName);

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
