const { PutObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3Client = new S3Client({});

exports.handler = async (event) => {
  const bucketName = process.env.BUCKET_NAME;

  const fileName = event.queryStringParameters?.name;

  if(!fileName)  return {
    statusCode: 400,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods:": "POST,GET,PUT,DELETE,OPTIONS",
    },
    body: JSON.stringify({ message: "Parameter FileName is missing" }),
  };

  const signedUrl = await getSignedUrl(
    s3Client,
    new PutObjectCommand({
      ContentType: "text/csv",
      Bucket: bucketName,
      Key: `uploaded/${fileName}`,
    }),
    { expiresIn: 300 }
  );

  return  {
    statusCode: 200,
    headers: {
      "Content-Type": "text/plain",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST,GET,PUT,DELETE,OPTIONS",
    },
    body: JSON.stringify(signedUrl),
  };;
};