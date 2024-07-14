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
        console.log('authorizationToken', event.authorizationToken);
        const encodedCreds = event.authorizationToken.split(' ')[1];
        const buff = Buffer.from(encodedCreds, 'base64');
        const plainCreds = buff.toString('utf-8').split(':');
        console.log('plainCreds', plainCreds);
        const [userName, password] = plainCreds;

        const storedUserPassword = process.env[userName];
        console.log('storedUserPassword', storedUserPassword);

        const effect = !storedUserPassword || storedUserPassword !== password ? 'Deny' : 'Allow';
        console.log('effect', effect);
        console.log('resource', event.methodArn);
        policy = generatePolicy(encodedCreds, effect, event.methodArn);
        return policy;
    } catch (error) {
        policy = generatePolicy('Unauthorized user', 'Deny', event.methodArn);
        return policy;
    }
};

const generatePolicy = (principalId, effect, resource) => {
    return {
        principalId,
        policyDocument: {
            Version: '2012-10-17',
            Statement: [
                {
                    Action: 'execute-api:Invoke',
                    Effect: effect,
                    Resource: resource
                }
            ]
        }
    };
};