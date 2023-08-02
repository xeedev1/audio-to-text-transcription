import {
  TranscribeClient,
  StartTranscriptionJobCommand,
  GetTranscriptionJobCommand,
} from "@aws-sdk/client-transcribe"; // CommonJS import
import axios from "axios";
import dotenv from "dotenv";
import { convertToDialogue } from "./download.js";
import { uploader } from "./uploader.js";
import multer from "multer";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
// app.use(bodyParser.text());

app.use(cors());
app.options("*", cors());

// Use body-parser middleware to parse application/json data
app.use(bodyParser.json());

// Use body-parser middleware to parse application/x-www-form-urlencoded data
app.use(bodyParser.urlencoded({ extended: true }));

const port = process.env.PORT || 3001;

const region = "us-west-2";
const credentials = {
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
};

// Configure nodemailer for sending emails
const transporter = nodemailer.createTransport({
  // service: "your_email_service_provider",
  host: "premium50.web-hosting.com",
  port: "465",
  secure: true,
  auth: {
    user: "admin@xeedev.com",
    pass: "yLhp@Y8$P6Me",
  },
});

// Utility function to send the email
const sendEmail = (to, fileUrl) => {
  const mailOptions = {
    from: "admin@xeedev.com",
    to: "zeemaxtechnologies@gmail.com",
    // to: to,
    subject: "File Upload Complete",
    text: `Your transcription has been completed successfully. You can access it using the link below:\n${fileUrl}`,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(error);
      } else {
        resolve(info);
        console.log("mail sent successfully");
      }
    });
  });
};

sendEmail("hehe", "www.lol.com");

// uploading file
const upload = multer({ dest: "uploads/" });

// get the response from frontend and process with openAI
app.post("/api/openai", async (req, res) => {
  // console.log("/api/openai", req.body.text);
  // res.json(req.body);
  let data = JSON.stringify({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are a assistant that is here to fix the dialogues user will send to you. please fix the dialogue, dont remove or add any other words. just fix the dialogue such that each speaker's words are complete",
      },
      {
        role: "user",
        content: `${req.body.text}`,
      },
    ],
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://api.openai.com/v1/chat/completions",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    data: data,
  };

  axios
    .request(config)
    .then((response) => {
      const responseFromOpenAi = response.data.choices[0].message.content;
      console.log(responseFromOpenAi);
      res.json(responseFromOpenAi);
      // process.exit();
    })
    .catch((error) => {
      console.log(error);
    });
});

// get the response from frontend and Generate Summaries
app.post("/api/openaiSummarize", async (req, res) => {
  // console.log("/api/openai", req.body.text);
  // res.json(req.body);
  let data = JSON.stringify({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are an amazing assistant",
      },
      {
        role: "user",
        content: `Can you write two options for a podcast title, two 75 word options for a podcast description, an episode summary description post for Instagram, an episode summary description post for YouTube, an episode summary description post for Twitter, a 250 word blog post, two 30 second quotes from the episode for Instagram, two sixty second quotes from the episode for YouTube, two 15 second quotes from the episode for Twitter, and write in the style of the podcast host. Use the transcript of the podcast as reference here: ${req.body.text}`,
      },
    ],
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://api.openai.com/v1/chat/completions",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    data: data,
  };

  axios
    .request(config)
    .then((response) => {
      const responseFromOpenAi = response.data.choices[0].message.content;
      console.log(responseFromOpenAi);
      res.json(responseFromOpenAi);
      // process.exit();
    })
    .catch((error) => {
      console.log(error);
    });
});

app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    const inputFile = req.file.path;
    let fileName = await uploader(inputFile);
    console.log(fileName);

    // details to be sent to the server
    const input = {
      TranscriptionJobName: `${fileName}`,
      LanguageCode: "en-US",
      Media: {
        MediaFileUri: `s3://xeedev-bucket-us-west-2/${fileName}`,
      },
      OutputBucketName: "xeedev-bucket-us-west-2",
      Settings: {
        ChannelIdentification: true,
        ShowSpeakerLabels: true,
        MaxSpeakerLabels: 9, // Set the expected number of speakers here (between 2 and 10)
      },
    };

    // start transcription job
    async function startTranscriptionRequest() {
      // res.json(transcriptionStarted: true)
      const transcribeConfig = {
        region,
        credentials,
      };
      const transcribeClient = new TranscribeClient(transcribeConfig);
      const transcribeCommand = new StartTranscriptionJobCommand(input);
      try {
        const transcribeResponse = await transcribeClient.send(
          transcribeCommand
        );
        console.log("Transcription job created, the details:");
        console.log(transcribeResponse.TranscriptionJob);
        const jobId = transcribeResponse.TranscriptionJob.TranscriptionJobName;
        const jobStatus =
          transcribeResponse.TranscriptionJob.TranscriptionJobStatus;
        await waitForTranscriptionJob(transcribeClient, jobId, jobStatus);
      } catch (err) {
        console.log(err);
      }
    }

    //  get the response after the transcription is done
    async function waitForTranscriptionJob(client, jobId, previousJobStatus) {
      const getTranscriptionJobCommand = new GetTranscriptionJobCommand({
        TranscriptionJobName: jobId,
      });
      const { TranscriptionJob } = await client.send(
        getTranscriptionJobCommand
      );
      const currentJobStatus = TranscriptionJob.TranscriptionJobStatus;

      if (currentJobStatus === "COMPLETED") {
        console.log("Transcription job completed!");
        const transcriptUri = TranscriptionJob.Transcript.TranscriptFileUri;
        // console.log(transcriptUri);
        let dataFromDownload = await convertToDialogue(
          `${input.TranscriptionJobName}.json`
        );
        // console.log("dataFromDownload: ", dataFromDownload);

        res.json(dataFromDownload);

        console.log(`done, key: ${input.TranscriptionJobName}.json`);
      } else if (
        currentJobStatus === "FAILED" ||
        currentJobStatus === "CANCELED"
      ) {
        console.log("Transcription job failed or was canceled.");
      } else if (currentJobStatus === previousJobStatus) {
        console.log(
          "Transcription job is still in progress. Checking again in 5 seconds..."
        );
        await sleep(5000);
        await waitForTranscriptionJob(client, jobId, currentJobStatus);
      }
    }

    function sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    startTranscriptionRequest();
  } catch (error) {
    console.error("Uploader:", error);
  }
});

// process.exit();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.get("/check", (req, res) => {
  res.send("Poship-3.0.0");
});
