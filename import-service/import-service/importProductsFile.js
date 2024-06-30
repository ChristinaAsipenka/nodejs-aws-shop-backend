const s3 = require('aws-cdk-lib/aws-s3');

exports.handler = async (event) => {
    const fileName = event.queryStringParameters.name;
    const bucketName = process.env.BUCKET_NAME;
    const objectKey = `uploaded/${fileName}`;

    const params = {
        Bucket: bucketName,
        Key: objectKey,
        Expires: 3600
    };

    const signedUrl = new s3.getSignedUrl('putObject', params);

    return {
        statusCode: 200,
        body: JSON.stringify(signedUrl),
        headers: {
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": 'GET,POST,OPTIONS',
            "Access-Control-Allow-Origin": '*',
            "Content-Type": "application/json"
        }
    };
}