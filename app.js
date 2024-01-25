import "dotenv/config";
import express from "express";
import apiRoute from "./route/apiRoute.js";
import { default as viber, bot } from "./route/viber/viber.js";
import fs from "fs";
import https from "https";

const app = express();

//middleware
app.use(express.static("public"));

// HTML api
app.use("/openai", apiRoute);

// viber api
app.use("/viber", viber);

const PORT = process.env.PORT || 5500;

const avmotoe7_url = "https://avmotoe7.tech:5500/viber";
const ngrok_url = "https://08b3-188-120-99-51.ngrok-free.app/viber";

// Izbor da li se pokrece lokalni server ili cloud na AWS
// lokalni   : webhookUrl = ngrok_url;
// AWS cloud : webhookUrl = avmotoe7_url;

const webhookUrl = ngrok_url;
// webhookUrl = avmotoe7_url;

//> Javna IP adresa, server na lokalnoj masini
if (webhookUrl == ngrok_url)
  app.listen(PORT, () => {
    bot.setWebhook(webhookUrl);
    console.log(`Server running on localhost, public IP at PORT ${PORT}...`);
  });
//
//> Javna IP, server na AWS
else if (webhookUrl == avmotoe7_url) {
  const crt = {
    key: fs.readFileSync("./cert/certificate.key"),
    cert: fs.readFileSync("./cert/certificate.crt"),
  };

  https.createServer(crt, app).listen(PORT, () => {
    bot.setWebhook(webhookUrl);
    console.log(`Server running on AWS at PORT ${PORT}...`);
  });
  //
  //> Server nije pokrenut
} else {
  `Server is not running ...`;
}

// // ovo je samo za http
// app.listen(PORT, () => {
//   console.log(`Listen on port ${PORT} ...`);
// });
