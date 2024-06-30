#!/usr/bin/env node

const cdk = require('aws-cdk-lib');
const { ImportServiceStack } = require('../lib/import-service-stack');

const app = new cdk.App();
new ImportServiceStack(app, 'ImportServiceStack', {});
