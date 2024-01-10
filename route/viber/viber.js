import viber_bot from "viber-bot";
const ViberBot = viber_bot.Bot;
const BotEvents = viber_bot.Events;
const TextMessage = viber_bot.Message.Text;

import { gptChat } from "../../my_openai/my-openai.js";
import { tools_list, callback } from "../../my_openai/my-openai-tools.js";
import sys_msg from "../openai_sysmsg.js";

import express from "express";
const router = express.Router();

import { delMessages, insMessage, getMessages } from "./logdb.js";

const bot = new ViberBot({
  authToken: "5237ad1ff8e7d30e-e1d08d4b661d4422-ccef8c20dcf29cfb",
  name: "TestOpenAIBot",
  // It is recommended to be 720x720, and no more than 100kb.
  avatar: "https://raw.githubusercontent.com/devrelv/drop/master/151-icon.png",
  // avatar: "file:./151-icon.png",
});

// Perfect! Now here's the key part:
bot.on(BotEvents.MESSAGE_RECEIVED, async (message, response) => {
  // Your bot logic should sit here.
  console.log("---------- MESSAGE_RECEIVED BEGIN ----------");

  //> obrisi stare poruke, starije od 1h
  await delMessages(1);

  //> dodaj novu poruku u bazu
  const last_msg = { role: "user", content: message.text };
  const row = {
    user_id: response.userProfile.id,
    time_stamp: message.timestamp.toString(),
    msg_json: JSON.stringify(last_msg),
  };
  await insMessage(row);

  //> ucitaj predhodnu konverzaciju iz baze i formiraj niz poruka - dialog
  const dialog = await getMessages(response.userProfile.id);

  //> prosledi dialog ka openai
  //
  // format objekta openai server
  const requestBody = {
    model: "gpt-3.5-turbo-1106",
    temperature: 1.0,
    messages: [],
    tools: tools_list,
  };
  const msg = [...sys_msg];
  msg.push(...dialog);
  requestBody.messages = msg;
  const retAI = await gptChat(requestBody, callback);
  const answer = retAI.choices[0].message
  
  console.log(answer.content);
  //
  //> formiraj poruku za odgovor
  const timestamp = new Date().getTime().toString();

  const resp_message = new TextMessage(
    answer.content,
    null,
    null,
    timestamp
  );

  console.log("---------- MESSAGE_RECEIVED END ----------");

  response.send(resp_message);
});

bot.on(BotEvents.MESSAGE_SENT, async (message, userProfile) => {
  console.log("---------- MESSAGE_SENT BEGIN ----------");

  //> formiraj objekat za zapis
  const row = {
    user_id: userProfile.id,
    time_stamp: message.timestamp,
    msg_json: JSON.stringify({ role: "assistant", content: message.text }),
  };

  await insMessage(row);
  console.log(row);

  console.log("---------- MESSAGE_SENT END ----------");
});

bot.on(BotEvents.SUBSCRIBED, (response) => {
  console.log("---------- SUBSCRIBED BEGIN ----------");
  console.log("---------- SUBSCRIBED END ----------");
});

bot.on(BotEvents.UNSUBSCRIBED, (response) => {
  console.log("---------- UNSUBSCRIBED BEGIN ----------");
  //> obrisi poruke iz baze
  console.log("---------- UNSUBSCRIBED END ----------");
});

bot.on(
  BotEvents.CONVERSATION_STARTED,
  (userProfile, isSubscribed, context, onFinish) => {
    console.log("---------- CONVERSATION_STARTED BEGIN ----------");
    console.log("---------- CONVERSATION_STARTED END ----------");
  }
);

//> podesi middleware
router.use(bot.middleware());

export { router as default, bot };
