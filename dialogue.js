import fs from "fs";
const filepath = "";

// Read the file asynchronously
fs.readFile(
  "C:/Users/Administrator/Desktop/vacks/.done/podship-test/hello-s3-downloaded.txt",
  "utf8",
  (err, data) => {
    if (err) {
      console.error("Error reading the file:", err);
      return;
    }

    // Parse the JSON data into a JavaScript object
    try {
      const jsonData = JSON.parse(data);
      const channels = jsonData;
      console.log(jsonData);
      return channels;
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
    }
  }
);

channels.forEach((c) => {
  const dialogue = createDialogue(c.items);
  console.log("dialogue", dialogue);
});

function createDialogue(items) {
  let dialogue = "";
  let currentSpeaker = "";
  let currentContent = "";

  for (let i = 0; i < items.length; i++) {
    const { speaker_label, alternatives } = items[i];
    const content = alternatives[0]?.content.trim();

    if (content) {
      if (speaker_label !== currentSpeaker) {
        if (currentSpeaker !== "") {
          dialogue += `${currentSpeaker}: ${currentContent}\n`;
        }
        currentSpeaker = speaker_label;
        currentContent = content;
      } else {
        currentContent += " " + content;
      }
    }
  }

  // Add the last speaker's content to the dialogue
  if (currentSpeaker !== "") {
    dialogue += `${currentSpeaker}: ${currentContent}\n`;
  }

  return dialogue;
}
