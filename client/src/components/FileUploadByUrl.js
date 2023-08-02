import React, { useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink } from "@fortawesome/free-solid-svg-icons";
import ProgressBar from "react-progressbar";
import { useNavigate } from "react-router-dom";
import { useTranscription } from "./TranscriptionContext";

const FileDownloadAndUpload = () => {
  const [fileUrl, setFileUrl] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();
  const { setTranscription } = useTranscription();
  const [showButton, setShowButton] = useState(false);
  const [error, setError] = useState(null);

  const handleFileDownloadAndUpload = async () => {
    try {
      const allowedExtensions = [
        "m4a",
        "mp3",
        "webm",
        "mp4",
        "mpga",
        "wav",
        "mpeg",
      ];
      const urlPattern =
        /^(http|https):\/\/[^ "]+\.(m4a|mp3|webm|mp4|mpga|wav|mpeg)$/i;

      if (!urlPattern.test(fileUrl)) {
        setError(
          "Invalid URL or file format. Please provide a valid URL with a supported file extension."
        );
        return;
      }

      const fileExtension = fileUrl.split(".").pop()?.toLowerCase();

      if (!allowedExtensions.includes(fileExtension)) {
        console.log(
          "Invalid file format. Please provide a file with a valid extension."
        );
        return;
      }

      setUploadStatus("fetchingFile");
      setError(null);
      // Make a request to the server to download the file
      const downloadResponse = await axios.get(
        "http://localhost:3001/api/download",
        {
          params: {
            url: fileUrl,
          },
          responseType: "blob",
          onDownloadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setDownloadProgress(progress);
          },
        }
      );

      try {
        setUploadStatus("uploading");

        const formData = new FormData();
        formData.append("file", downloadResponse.data);

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
              setUploadProgress(progress);
            },
          }
        );

        setTranscription(response);
        navigate("/transcription");
        setUploadStatus("uploaded");
        console.log("File uploaded successfully");
        // Handle the response
      } catch (error) {
        setError("Error uploading file:", error);
        // Handle the error
      }
    } catch (error) {
      setError("Error downloading file:", error);
    }
  };

  return (
    <>
      <div className="box-2">
        <FontAwesomeIcon icon={faLink} />
        <h1 className="box-title">Share a link to public file</h1>
        <p className="note">
          Supported files: m4a, mp3, webm, mp4, mpga, wav, mpeg
        </p>
        {showButton ? (
          <div>
            <input
              type="text"
              className="upload-file-input"
              placeholder="Enter file URL"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
            />
            <button
              className="btn btn-info custom-btn-info"
              onClick={handleFileDownloadAndUpload}
            >
              GET FILE
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setShowButton(true);
            }}
            className="btn btn-info custom-btn-info"
          >
            PASTE A URL
          </button>
        )}
        {error && <div className="error-message">{error}</div>}
        <ProgressBar className="mt-2" completed={downloadProgress} />
        {uploadStatus === "fetchingFile" && (
          <p className="ud-message">Fetching file from url</p>
        )}
        {uploadStatus === "uploading" && (
          <p className="ud-message">Processing</p>
        )}
        {uploadStatus === "uploaded" && (
          <p className="ud-message">File Uploaded.</p>
        )}
        <ProgressBar className="mt-2" completed={uploadProgress} />
      </div>
    </>
  );
};

export default FileDownloadAndUpload;
