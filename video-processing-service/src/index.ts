import express from "express";
// cli or wrapper
import ffmpeg from "fluent-ffmpeg"

const app = express();


app.get("/process-video", (req, res) => {
  const inputFilePath = req.body.inputFilePath;
  const outputFilePath = req.body.outputFilePath;

  if (!inputFilePath || ! outputFilePath) {
    res.status(400).send("Bad request: MIssing file path.");
  }

  ffmpeg(inputFilePath)
    .outputOptions("-vf", "scale=-1:360") //360p quality
    .on("end", () => {
      res.status(200).send("Processing finished successfully.")
    })
    .on("error", (err) => {
      console.log(`An error occurred: ${err.message}`);
      res.status(500).send(`Internal Server Error: ${err.message}`);
    })
    .save(outputFilePath);

  // return res.status(200).send("Video processing started.")
})
const port = process.env.port || 3000;

app.listen(port, () => {
  console.log(`VPS listening at http://localhost.${port}`)
})

