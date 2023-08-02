import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { readFileSync } from "fs";
import dotenv from "dotenv";
import Chance from "chance";

export const uploader = async (inputFile) => {
  try {
    var chance = new Chance();
    dotenv.config();

    const filename = chance.string({
      length: 10,
      pool: "abcdefghijklmnopqrstuvwxyz_",
    });

    // Specify the AWS region and credentials
    const region = "us-west-2";
    const credentials = {
      accessKeyId: process.env.ACCESS_KEY_ID,
      secretAccessKey: process.env.SECRET_ACCESS_KEY,
    };

    const client = new S3Client({
      region,
      credentials,
    });

    //   const audioFilePath = "./y2mate.com - Small Talk  Everyday English_480p.mp4"; // Replace with the path to your audio file
    const audioFilePath = inputFile;
    const bucketName = "xeedev-bucket-us-west-2";
    const objectKey = `${filename}`; // Replace with the desired key for the audio file in S3

    try {
      // Read the audio file as binary data
      const fileContent = readFileSync(audioFilePath);

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
        Body: fileContent, // Use the binary data as the Body parameter
      });

      const response = await client.send(command);
      console.log("File uploaded successfully. ", filename);

      return objectKey;
    } catch (err) {
      console.error("Error uploading file:", err);
    }
  } catch (error) {
    console.error("Uploader:", error);
  }
};

// Call the uploader function to initiate the upload
// uploader();
