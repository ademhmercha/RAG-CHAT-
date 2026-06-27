// YouTube transcript loader.
// Fetches the transcript/captions of a YouTube video and returns the text.

const { YoutubeTranscript } = require("youtube-transcript");

const extract = async (videoId) => {
  const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
  const text = transcriptItems.map((item) => item.text).join(" ");
  return text;
};

module.exports = { extract };
