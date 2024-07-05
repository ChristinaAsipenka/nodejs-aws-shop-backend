const { S3Client, GetObjectCommand, CopyObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const csv = require("csv-parser");
const AWS = require("aws-sdk");
const { Readable } = require("stream");

const s3 = new S3Client({ region: "eu-west-1" });
const sqs = new AWS.SQS();

exports.handler = async (event) => {
  const bucket = event.Records[0].s3.bucket.name;
  const key = event.Records[0].s3.object.key;
  const catalogItemsQueueUrl = process.env.CATALOG_ITEMS_QUEUE_URL;

  const params = {
    Bucket: bucket,
    Key: key,
    ContentType: "text/csv",
  };

  try {
    const command = new GetObjectCommand(params);
    const { Body } = await s3.send(command);

    if (!(Body instanceof Readable)) {
      throw new Error("Body is not a Readable stream");
    }

    await new Promise((resolve, reject) => {
      Body.pipe(csv({
        columns: true,
        relax_quotes: true,
        escape: '\\',
        ltrim: true,
        rtrim: true
      }))
          .on("data", async (data) => {
            try {
            console.log(data);
              const messageParams = {
                QueueUrl: catalogItemsQueueUrl,
                MessageBody: JSON.stringify(data),
              };
              await sqs.sendMessage(messageParams).promise();
              console.log("Message sent to SQS:", data);
            } catch (error) {
              console.error("Error sending message to SQS:", error);
              reject(error);
            }
            console.log("Record: ", data);
          })
          .on("end", async () => {
            console.log("CSV file processed successfully.");

            try {
              const newKey = key.replace("uploaded/", "parsed/");

              const copyParams = {
                Bucket: bucket,
                CopySource: `${bucket}/${key}`,
                Key: newKey,
                ContentType: "text/csv",
              };
              const copyCommand = new CopyObjectCommand(copyParams);
              await s3.send(copyCommand);

              const deleteParams = {
                Bucket: bucket,
                Key: key,
                ContentType: "text/csv",
              };
              const deleteCommand = new DeleteObjectCommand(deleteParams);
              await s3.send(deleteCommand);

              console.log(`File copied to ${newKey} and deleted from ${key}`);
              resolve();
            } catch (error) {
              console.error("Error during file copy or delete:", error);
              reject(error);
            }
          })
          .on("error", (err) => {
            console.error("Error processing CSV file:", err);
            reject(err);
          });
    });

  } catch (error) {
    console.error("Error fetching object from S3:", error);
    throw error; // Rethrow the error to ensure Lambda handles it appropriately
  }
};
