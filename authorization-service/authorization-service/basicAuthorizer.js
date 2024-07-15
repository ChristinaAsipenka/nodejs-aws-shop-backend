const dotenv = require('dotenv');

dotenv.config();

exports.handler = async (event) => {
    console.log("request", JSON.stringify(event));
    let policy;
    if (event.type !== 'TOKEN') {
        policy = generatePolicy('Unauthorized user', 'Deny', event.methodArn);
        return policy;
    }
    try {
        const encodedCreds = event.authorizationToken.split(' ')[1];
        const buffer = Buffer.from(encodedCreds, 'base64');
        const clientCreds = buffer.toString('utf-8').split(':');
        const [userName, password] = clientCreds;
        const envUserPassword = process.env[userName];
        const result = !envUserPassword || envUserPassword !== password ? 'Deny' : 'Allow';
        policy = generatePolicy(encodedCreds, result, event.methodArn);
        return policy;
    } catch (error) {
        policy = generatePolicy('Unauthorized user', 'Deny', event.methodArn);
        return policy;
    }
};

const generatePolicy = (principalId, result, resource) => {
    return {
        principalId,
        policyDocument: {
            Version: '2012-10-17',
            Statement: [
                {
                    Action: 'execute-api:Invoke',
                    Effect: result,
                    Resource: resource
                }
            ]
        }
    };
};