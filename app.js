import express from "express";
import apiRoute from "./route/apiRoute.js";
import { default as viber, bot } from "./route/viber/viber.js";
import fs from "fs";
import https from "https";

const app = express();

//middleware
app.use(express.static('public'));

// HTML api
app.use("/openai", apiRoute);

// viber api
app.use("/viber", viber);

const crt = {
  key: fs.readFileSync("./cert/certificate.key"),
  cert: fs.readFileSync("./cert/certificate.crt"),
};

const PORT = process.env.PORT || 5500;

// const webhookUrl = "https://69ab-188-120-96-3.ngrok-free.app/viber";
// app.listen(PORT, () => {
//   bot.setWebhook(webhookUrl);
//   console.log(`Server running at PORT ${PORT}...`);
// });

const webhookUrl = "https://avmotoe7.tech:5500/viber";
https.createServer(crt, app).listen(PORT, () => {
  bot.setWebhook(webhookUrl);
  console.log(`Server running at PORT ${PORT}...`);
});
