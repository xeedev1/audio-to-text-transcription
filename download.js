import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { createWriteStream, readFileSync } from "fs";
import dotenv from "dotenv";
dotenv.config();

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

const endsWithSentenceEnding = (content) => /[.!?,]$/.test(content);

export const convertToDialogue = async (transcriptFileName) => {
  console.log("file: ", transcriptFileName);
  const command = new GetObjectCommand({
    Bucket: "xeedev-bucket-us-west-2",
    Key: transcriptFileName,
  });

  try {
    const response = await client.send(command);
    const fileStream = createWriteStream("hello-s3-downloaded.json");

    // Pipe the S3 object data directly to the local file
    response.Body.pipe(fileStream);

    return new Promise((resolve, reject) => {
      // Event listener to handle the end of the write stream
      fileStream.on("finish", () => {
        console.log("File downloaded successfully!");

        // Read the contents of the downloaded file synchronously
        try {
          const fileContents = readFileSync(
            "hello-s3-downloaded.json",
            "utf-8"
          );
          // const jsonObject =  JSON.parse(fileContents);
          // console.log(
          //   "File contents:",
          //   jsonObject.results.channel_labels.channels
          // );

          let rawResponse = fileContents;

          rawResponse = JSON.parse(rawResponse);

          // conversion in the form of dialouges

          const dialogues = createDialogues(
            rawResponse.results.channel_labels.channels
          );

          function createDialogues(channels) {
            const dialogues = [];

            // Get the first channel only
            const channel = channels[0];

            const dialogue = createDialogue(channel.items);
            dialogues.push(dialogue);

            return dialogues;
          }

          function createDialogue(items) {
            const dialogue = [];
            let currentSpeaker = "";
            let currentContent = "";

            for (let i = 0; i < items.length; i++) {
              const { speaker_label, alternatives } = items[i];
              const content = alternatives[0]?.content.trim();

              if (content) {
                if (speaker_label !== currentSpeaker) {
                  if (currentSpeaker !== "") {
                    dialogue.push(`${currentSpeaker}: ${currentContent}`);
                  }
                  // currentSpeaker = "Speaker " + speaker_label.slice(-1);
                  currentSpeaker = speaker_label;
                  currentContent = content;
                } else if (endsWithSentenceEnding(content)) {
                  currentContent += content;
                } else {
                  currentContent += " " + content;
                }
              }
            }

            // Add the last speaker's content to the dialogue
            if (currentSpeaker !== "") {
              dialogue.push(`${currentSpeaker}: ${currentContent}`);
            }

            return dialogue;
          }

          // Display the dialogues in the desired format
          console.log(dialogues);
          resolve(dialogues);
        } catch (err) {
          console.error("Error reading file:", err);
          reject(err);
        }
      });

      // Event listener to handle any errors during the write process
      fileStream.on("error", (err) => {
        console.error("Error downloading file:", err);
      });
    });
  } catch (err) {
    console.error(err);
  }
};

// convertToDialogue("szbjigwwij.json");
