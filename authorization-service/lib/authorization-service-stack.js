const { Stack } = require("aws-cdk-lib");
const lambda = require('aws-cdk-lib/aws-lambda');
const iam = require("aws-cdk-lib/aws-iam");
const cdk = require('aws-cdk-lib');
const dotenv = require('dotenv');

dotenv.config();

class AuthorizationServiceStack extends Stack {
    /**
     *
     * @param {Construct} scope
     * @param {string} id
     * @param {StackProps=} props
     */
    constructor(scope, id, props) {
        super(scope, id, props);

        const basicAuthorizerFunction = new lambda.Function(
            this,
            "BasicAuthorizerFunction",
            {
                code: lambda.Code.fromAsset("authorization-service"),
                handler: "basicAuthorizer.handler",
                runtime: lambda.Runtime.NODEJS_20_X,
                environment: {
                    ChristinaAsipenka: process.env.ChristinaAsipenka
                }
            });

     /*  const invokeFunction = new cdk.CustomResource(this, 'InvokeFunction', {
            serviceToken: basicAuthorizerFunction.functionArn
        });*/

        basicAuthorizerFunction.grantInvoke(new iam.ServicePrincipal('apigateway.amazonaws.com'));

        new cdk.CfnOutput(this, 'BasicAuthorizer', {
            value: basicAuthorizerFunction.functionArn,
            exportName: 'BasicAuthorizerFunctionArn'
        });
        new cdk.CfnOutput(this, 'BasicAuthorizerRole', {
            value: basicAuthorizerFunction.role.roleArn,
            exportName: "BasicAuthorizerFunctionArnRole"
    })
    }
}

module.exports = {AuthorizationServiceStack}
