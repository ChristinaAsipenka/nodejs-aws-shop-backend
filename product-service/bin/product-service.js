#!/usr/bin/env node

const cdk = require('aws-cdk-lib');
const { ProductServiceStack } = require('../lib/product-service-stack');

const app = new cdk.App();
new ProductServiceStack(app, 'ProductServiceStack', {

});
