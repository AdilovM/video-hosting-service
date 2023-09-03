import express from "express";
import { convertVideo, deleteProcessedVideo, deleteRawVideo, downloadRawVideo, setupDirectores, uploadProcessedVideo } from "./video-storage";
setupDirectores();

const app = express();
app.use(express.json());
app.post("/process-video", async (req, res) => {
  let data;
  try {
    const message = Buffer.from(req.body.message.data, 'base64').toString('utf-8');
    data = JSON.parse(message);
    if (!data.name) {
      throw new Error('Invalid message payload received.');
    }
  } catch (error) {
    console.log(error);
    return res.status(400).send('Bad Request: missing filename.');
  }

  const inputFileName = data.name;
  const outputFileName = `processed-${inputFileName}`;


  // Download raw video from Cloud storage
  await downloadRawVideo(inputFileName);

  // conver video to 360p
  try {
    await convertVideo(inputFileName, outputFileName)
  } catch (err) {
    await Promise.all([
      deleteRawVideo(inputFileName),
      deleteProcessedVideo(outputFileName)
    ])
      console.log(err);
      return res.status(500).send(`Internal Server Error: video processing failed`);
  }

  // Upload processed video into Cloud storage
  await uploadProcessedVideo(outputFileName);
  await Promise.all([
    deleteRawVideo(inputFileName),
    deleteProcessedVideo(outputFileName)
  ])

  return res.status(200).send('Processing finished successfully.')
})
const port = process.env.port || 3000;

app.listen(port, () => {
  console.log(`VPS listening at http://localhost:${port}`)
})

