import React, { useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import ProgressBar from "react-progressbar";
import { useNavigate } from "react-router-dom";
import { useTranscription } from "./TranscriptionContext";

const FileUpload = () => {
  const [file, setFile] = useState({ name: "" });
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const { setTranscription } = useTranscription();
  const navigate = useNavigate();

  const currentTime = new Date();
  const allowedExtensions = [
    "amr",
    "flac",
    "m4a",
    "mp4",
    "mp3",
    "wav",
    "webm",
    "ogg",
  ];

  const handleFileUpload = async (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    console.log(currentTime, selectedFile);

    const fileExtension = selectedFile.name.split(".").pop().toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      setError(
        `Please upload a file with a valid extension i.e. "amr",
        "flac",
        "m4a",
        "mp4",
        "mp3",
        "wav",
        "webm",
        "ogg",`
      );
      return;
    }

    try {
      setUploadStatus("Uploading");
      setError(null);

      const formData = new FormData();
      formData.append("file", selectedFile);

      // let isMP3 = false;
      // if (fileExtension === "mp3") {
      //   isMP3 = true;
      // }

      // formData.append("isMP3", isMP3);
      // console.log("mp3?", isMP3);

      const response = await axios.post(
        "http://localhost:3001/api/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(currentTime, progress);
            setUploadProgress(progress);
          },
        }
      );

      console.log(response.data);

      navigate("/transcription");

      setUploadStatus("Uploaded");
      setUploaded(true);
      console.log("File uploaded successfully");
      setTranscription(response);
    } catch (error) {
      console.error("Error uploading file:", error);
      setError(error.message);
    }
  };

  return (
    <>
      <div className="box-1">
        <FontAwesomeIcon icon={faUpload} />
        <h1 className="box-title">
          Upload files from your computer or drag and drop
        </h1>
        <p className="note">
          Supported files: m4a, mp3, webm, mp4, mpga, wav, mpeg
        </p>
        {uploadStatus === "" && (
          <button className="btn btn-info custom-btn-info">UPLOAD FILES</button>
        )}
        <div className="custom-input-file">
          <div className="drag-file-upload"></div>
          <input
            className="form-control"
            id="formFile"
            type="file"
            onChange={handleFileUpload}
          />
        </div>
        {uploaded && <p>File Name: {file.name}</p>}
        {uploadStatus === "Uploading" && (
          <p className="ud-message">Uploading</p>
        )}
        {uploadStatus === "Uploaded" && (
          <p className="ud-message">File Uploaded</p>
        )}
        <ProgressBar completed={uploadProgress} />
        {error && <div className="error-message">{error}</div>}
      </div>
    </>
  );
};

export default FileUpload;
