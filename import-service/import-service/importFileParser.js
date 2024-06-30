const {
  S3Client,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { csvParser } = require("csv-parser");
const { Readable } = require("stream");

const s3 = new S3Client({ region:"us-east-1" });

exports.handler = async (event) => {
  const bucket = event.Records[0].s3.bucket.name;
  const key = event.Records[0].s3.object.key;

  const params = {
    Bucket: bucket,
    Key: key,
    ContentType: "text/csv",
  };

  const command = new GetObjectCommand(params);
  const { Body } = await s3.send(command);

  if (Body instanceof Readable) {
    await new Promise((resolve, reject) => {
      Body.pipe(csvParser())
        .on("data", (data) => {
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
  } else {
    console.error("Body is not a Readable stream");
  }
};