import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

function SpeakerSelection() {
  const [data, setData] = useState(""); // Use an empty string as initial state

  const location = useLocation();
  const { enhancedResponse } = location.state || {};

  console.log("response from SpeakerSelection", enhancedResponse);

  // find number of speakers
  function findSpeakers(data) {
    const speakers = [];
    const regex = /(\w+):/g; // Regular expression to match the speaker names

    let match;
    while ((match = regex.exec(data)) !== null) {
      const speakerName = match[1]; // Extract the speaker name from the match
      if (!speakers.includes(speakerName)) {
        speakers.push(speakerName); // Add the speaker name to the array if not already present
      }
    }

    return speakers;
  }

  const speakers = findSpeakers(enhancedResponse);
  console.log(speakers);

  // Use useEffect to watch for changes to the enhancedResponse prop
  useEffect(() => {
    // When the enhancedResponse prop changes, update the data state
    setData(enhancedResponse);
  }, [enhancedResponse]);
  // console.log("response from SpeakerSelection", enhancedResponse);
  // Rest of the component code remains the same
  const [totalSpeakers, setTotalSpeakers] = useState(speakers);
  const [selectedSpeaker, setSelectedSpeaker] = useState("Select Speaker");
  const [nameInput, setNameInput] = useState("");
  const [summery, setSummery] = useState("");

  const handleSpeaker = (e) => {
    setSelectedSpeaker((prev) => (prev = e.target.value));
  };

  const handleName = (e) => {
    setNameInput(e.target.value);
  };

  const changeName = (e) => {
    e.preventDefault();

    const newName = nameInput;

    if (newName === "") {
      alert("Please enter a valid name!");
      return;
    }

    // Change Selected Speaker in dropdown menu
    setTotalSpeakers((prev) =>
      prev.map((name) => (name === selectedSpeaker ? newName : name))
    );

    // Replace speaker name with provided name
    setData((prevData) =>
      prevData.replace(new RegExp(selectedSpeaker, "g"), newName)
    );

    setNameInput("");
  };

  // file download
  // ===============================================================
  const handleDownload = () => {
    const blob = new Blob([data], { type: "text/plain" }); // Create a blob from the formatted text
    const url = URL.createObjectURL(blob); // Create a URL for the blob
    const link = document.createElement("a");
    link.href = url;
    link.download = `transcription.doc`; // Set the desired file name with the .doc extension
    link.click(); // Programmatically click the link to trigger the download
    URL.revokeObjectURL(url); // Clean up the URL and link
    link.remove();
  };

  const handleDownload2 = () => {
    const blob = new Blob([summery], { type: "text/plain" }); // Create a blob from the formatted text
    const url = URL.createObjectURL(blob); // Create a URL for the blob
    const link = document.createElement("a");
    link.href = url;
    link.download = `summary.doc`; // Set the desired file name with the .doc extension
    link.click(); // Programmatically click the link to trigger the download
    URL.revokeObjectURL(url); // Clean up the URL and link
    link.remove();
  };

  // summeries
  //================================================================
  // const question = "";

  const openAiSummerize = async (data) => {
    try {
      console.log("posted data:", data);
      const response = await axios.post(
        "http://localhost:3001/api/openaiSummarize",
        { text: data },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      let summeryResponse = response.data;
      // console.log(summeryResponse);

      // Set the API response directly to enhancedResponse state
      setSummery(summeryResponse);
    } catch (error) {
      console.error("Error occurred while making the request:", error);
    }
  };

  useEffect(() => {
    // Call the API request function here after the component is mounted
    openAiSummerize(data);
  }, []);

  return (
    <div className="transcription-box">
      <div className="d-flex justify-content-between">
        <h1>Edit Speakers</h1>
        {data && (
          <button className="btn btn-info" onClick={handleDownload}>
            Download
          </button>
        )}
      </div>
      <select
        className="form-select w-auto"
        name="speakers"
        id="speakers"
        value={selectedSpeaker}
        onChange={handleSpeaker}
      >
        <option>Select Speaker</option>
        {totalSpeakers.map((op, idx) => {
          return <option key={idx}>{op}</option>;
        })}
      </select>
      <br />
      <div className="inputContainer">
        <label htmlFor="name">Replace With: </label>
        <br />
        <input
          className="form-control w-auto d-inline-block"
          type="text"
          id="name"
          value={nameInput}
          onChange={handleName}
        />
        <button className="btn btn-info btn-confirm" onClick={changeName}>
          Confrim
        </button>
      </div>
      <br />
      <div>
        <pre className="dataShow">{data}</pre>
      </div>
      <div className="d-flex justify-content-between">
        <h1>Summary Content</h1>
        {data && (
          <button className="btn btn-info" onClick={handleDownload2}>
            Download
          </button>
        )}
      </div>
      <div>
        {summery ? <pre>{summery}</pre> : <div>Generating Summary...</div>}
      </div>
    </div>
  );
}

export default SpeakerSelection;
