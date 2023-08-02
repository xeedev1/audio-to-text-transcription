import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Transcript from "./pages/Transcript";
import Test from "./components/Test";
import { useState } from "react";
import EditSpeakers from "./pages/EditSpeakers"; // Import the Speaker component

function App() {
  // State to hold the enhanced response data
  const [enhancedResponse, setEnhancedResponse] = useState("");

  // Function to handle the received enhanced response data from Transcript.js
  const handleEnhancedResponse = (data) => {
    // Set the state with the received data
    setEnhancedResponse(data);
  };

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route
            path="transcription"
            element={<Transcript onDataReady={handleEnhancedResponse} />}
          />
          {/* Add a separate route for SpeakerSelection without a path */}
          <Route
            path="edit-speaker"
            element={<EditSpeakers enhancedResponse={enhancedResponse} />}
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}
export default App;
