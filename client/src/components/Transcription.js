import React, { useEffect, useState } from "react";
import { useTranscription } from "./TranscriptionContext";
import { Link, useNavigate } from "react-router-dom";
import Blob from "blob";
import axios from "axios";
import SpeakerSelection from "./SpeakerSelection"; // Import the SpeakerSelection component

const Transcript = () => {
  const navigate = useNavigate();
  const { transcriptionData } = useTranscription(); // Access the transcriptionData from the context
  const [enhancedResponse, setEnhancedResponse] = useState("");
  const [speakerData, setSpeakerData] = useState("");

  function convertToDialogues(data) {
    return data.data.map((conversation) =>
      conversation.map((message) => {
        const speaker = message.substring(0, 6); // Extract the first 6 characters
        const secondPart = message.substring(6); // Extract the rest of the characters
        return [speaker + " " + secondPart]; // Return an array containing both parts
      })
    );
  }

  const dialogues = convertToDialogues(transcriptionData);
  // console.log(dialogues);

  // Convert the dialogues data to a properly formatted text string
  const formattedText = dialogues
    .map((conversation, conversationIndex) =>
      conversation.map((message, messageIndex) => `${message}`).join("\n")
    )
    .join("\n");

  // file download
  // ===============================================================
  const handleDownload = () => {
    const blob = new Blob([formattedText], { type: "text/plain" }); // Create a blob from the formatted text
    const url = URL.createObjectURL(blob); // Create a URL for the blob
    const link = document.createElement("a");
    link.href = url;
    link.download = `transcription.doc`; // Set the desired file name with the .doc extension
    link.click(); // Programmatically click the link to trigger the download
    URL.revokeObjectURL(url); // Clean up the URL and link
    link.remove();
  };

  const openAiCorrection = async (data) => {
    try {
      const response = await axios.post(
        "http://localhost:3001/api/openai",
        { text: data },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      let responseData = response.data;
      console.log(responseData);

      // Set the API response directly to enhancedResponse state
      setEnhancedResponse(responseData);
    } catch (error) {
      console.error("Error occurred while making the request:", error);
    }
  };

  useEffect(() => {
    // Call the API request function here after the component is mounted
    openAiCorrection(formattedText);
  }, []);

  // Speaker Tags
  const editSpeakerNames = () => {
    // Navigate to the SpeakerSelection page with the enhancedResponse data as a query parameter
    navigate("/edit-speaker", { state: { enhancedResponse } });
  };

  return (
    <div className="transcription-box">
      {/* original response  */}
      <h1>Transcription</h1>
      {transcriptionData ? (
        <div>
          {dialogues.map((conversation, conversationIndex) => (
            <div key={conversationIndex}>
              {conversation.map((message, messageIndex) => (
                <div key={messageIndex}>{message}</div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-danger">No Data available</p>
      )}
      <br />

      {/* enhanced response from open AI  */}
      <h1>Enhanced Response</h1>
      <div>
        {enhancedResponse ? (
          <pre>{enhancedResponse}</pre>
        ) : (
          <div>generating...</div>
        )}
      </div>

      {/* download button  */}
      {transcriptionData ? (
        <button className="btn btn-info" onClick={handleDownload}>
          Download
        </button>
      ) : (
        <Link to="/">
          <button className="btn btn-info">Go Back To Homepage</button>
        </Link>
      )}
      {/* Edit Speaker Names button */}
      {enhancedResponse && (
        <button className="btn btn-info mx-2" onClick={editSpeakerNames}>
          Edit Speaker Names
        </button>
      )}
    </div>
  );
};

export default Transcript;

// complete till openai enhancement
