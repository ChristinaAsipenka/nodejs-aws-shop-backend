const { Stack, Duration, CfnOutput } = require('aws-cdk-lib');
const lambda = require('aws-cdk-lib/aws-lambda');
const apigateway = require('aws-cdk-lib/aws-apigateway');

class ProductServiceStack extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    const stage = 'dev';

    const getProductsList = new lambda.Function(this, 'getProductsList', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('product-service'),
      handler: 'get-products.handler',
    });

    const getProduct = new lambda.Function(this, 'getProduct', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('product-service'),
      handler: 'get-product.handler',
    });

    const api = new apigateway.LambdaRestApi(this, 'ProductServiceApi', {
      handler: getProductsList,
      proxy: false,
    });

    const productsResource = api.root.addResource('products');
    productsResource.addMethod('GET');

    const productResource = api.root.addResource('product');
    const productIdResource = productResource.addResource('{id}');
    productIdResource.addMethod('GET', new apigateway.LambdaIntegration(getProduct));
  }
}

module.exports = { ProductServiceStack };