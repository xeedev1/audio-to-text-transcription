import React, { useRef } from 'react';

const FileConverter = () => {
  const inputFileRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    console.log(file);
    const extension = file.name.split('.').pop().toLowerCase();

    if (!['m4a', 'mp3', 'webm', 'mp4', 'mpga', 'wav', 'mpeg'].includes(extension)) {
      alert('Unsupported file format.');
      return;
    }

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const fileReader = new FileReader();

    fileReader.onload = async () => {
      const arrayBuffer = fileReader.result;

      try {
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const audioDestination = audioContext.createMediaStreamDestination();
        const mediaRecorder = new MediaRecorder(audioDestination.stream);
        const chunks = [];

        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = async () => {
          const blob = new Blob(chunks, { type: 'audio/mp3' });
          console.log(blob);

          // Download the converted MP3 file
          const downloadLink = document.createElement('a');
          downloadLink.href = URL.createObjectURL(blob);
          downloadLink.download = `${file.name.split('.')[0]}.mp3`;
          downloadLink.click();
        };

        const audioBufferSource = audioContext.createBufferSource();
        audioBufferSource.buffer = audioBuffer;
        audioBufferSource.connect(audioDestination);

        mediaRecorder.start();
        audioBufferSource.start();

        setTimeout(() => {
          mediaRecorder.stop();
          audioBufferSource.stop();
          audioContext.close();
        }, audioBuffer.duration * 1000);
      } catch (error) {
        alert('Error converting the file.');
        console.error(error);
      }
    };

    fileReader.readAsArrayBuffer(file);
  };

  return (
    <div>
      <input type="file" accept=".m4a,.mp3,.webm,.mp4,.mpga,.wav,.mpeg" ref={inputFileRef} onChange={handleFileUpload} />
    </div>
  );
};

export default FileConverter;
