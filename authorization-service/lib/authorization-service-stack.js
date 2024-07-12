const { lambda } = require("aws-cdk-lib/aws-lambda");
const { iam } = require("aws-cdk-lib/aws-iam");
const { Construct } = require("constructs");
const { dotenv } = require("dotenv");
const { join } = require("path");

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

        /*const dotenvLayer = new lambda.LayerVersion(this, "DotenvLayer", {
            code: lambda.Code.fromAsset(
                join(__dirname, "..", "lambda-layer/lambda_layer.zip"),
            ),
            compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
            description: "A layer that includes the dotenv package",
        });*/

        const basicAuthorizerFunction = new lambda.Function(
            this,
            "BasicAuthorizerFunction",
            {
                code: lambda.Code.fromAsset(join(__dirname, "..", "lambda")),
                handler: "basicAuthorizer.handler",
                runtime: lambda.Runtime.NODEJS_20_X,
                environment: {
                  ChristinaAsipenka: process.env.ChristinaAsipenka}});


        basicAuthorizerFunction.addPermission("ApiGatewayInvokePermission", {
            principal: new iam.ServicePrincipal("apigateway.amazonaws.com"),
            action: "lambda:InvokeFunction",
            sourceArn: `arn:aws:execute-api:${this.region}:${this.account}:*/authorizers/*`,
        });
    }
}

module.exports = {AuthorizationServiceStack}
