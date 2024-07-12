const {
    APIGatewayAuthorizerResult,
    APIGatewayTokenAuthorizerEvent,
    StatementEffect,
} = require("aws-lambda");
const {dotenv} = require("dotenv");

dotenv.config();

const generatePolicy = (
    principalId,
    effect,
    resource,
    context = {}
) => {
    const authResponse = {
        principalId,
        policyDocument: {
            Version: "2012-10-17",
            Statement: [
                {
                    Action: "execute-api:Invoke",
                    Effect: effect,
                    Resource: resource,
                },
            ],
        },
        context,
    };
    return authResponse;
};

exports.handler = async (event) =>{
    console.log("Event:", event);

    const headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
    };

    if (!event.authorizationToken) {
        return generatePolicy("unauthorized", "Deny", event.methodArn, {
            statusCode: 401,
            headers: headers,
            message: "Unauthorized",
        });
    }

    const token = event.authorizationToken.split(" ")[1];
    const decodedCredentials = Buffer.from(token, "base64").toString("utf-8");
    const [username, password] = decodedCredentials.split(":");

    const storedPassword = process.env[username];

    try {
        if (storedPassword && storedPassword === password) {
            console.log("Successfully authorized!");
            return generatePolicy(username, "Allow", event.methodArn);
        } else {
            console.log("Unauthorized! Wrong credentials!");
            return generatePolicy("unauthorized", "Deny", event.methodArn, {
                statusCode: 403,
                headers: headers,
                message: "Forbidden",
            });
        }
    } catch (error) {
        console.log("Unhandled error!", error);
        return generatePolicy("unauthorized", "Deny", event.methodArn, {
            statusCode: 500,
            headers: headers,
            message: "Error during authorizatoion",
        });
    }
};