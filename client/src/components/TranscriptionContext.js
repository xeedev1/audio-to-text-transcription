import { createContext, useContext, useState } from 'react';

const TranscriptionContext = createContext();

export const TranscriptionProvider = ({ children }) => {
  const [transcriptionData, setTranscriptionData] = useState(null);

  const setTranscription = (data) => {
    setTranscriptionData(data);
  };

  return (
    <TranscriptionContext.Provider value={{ transcriptionData, setTranscription }}>
      {children}
    </TranscriptionContext.Provider>
  );
};

export const useTranscription = () => useContext(TranscriptionContext);
