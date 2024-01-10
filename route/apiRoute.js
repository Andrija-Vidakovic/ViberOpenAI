import express from "express";
import { gptChat } from "../my_openai/my-openai.js";
import { tools_list, callback } from "../my_openai/my-openai-tools.js";
import sys_msg from "./openai_sysmsg.js";

const router = express.Router();

//middleware
router.use(express.json());

// format objekta openai server
const requestBody = {
  model: "gpt-3.5-turbo-1106",
  temperature: 1.0,
  messages: [],
  tools: tools_list,
};

//*********************************************************************** */
// centralna funkcija preko koje klijent komunicira sa openai serverom
// Klijent salje niz poruka, ceo dijalog, koji se kacu u requestBody
// i salje ka openai serveru, poruka od servera se prosledjuje klijentu
//
//   klijent <--> Node js <--> openai 
//
router.post("/chat", async (req, res) => {
  const msg = [...sys_msg];
  msg.push(...req.body);
  requestBody.messages = msg;
  const response = await gptChat(requestBody, callback);
  res.json(response.choices[0].message);
});

//
// ------------- TEST rutine -----------------------
router.post("/echo", async (req, res) => {
  let msgs = req.body;
  console.log(msgs);
  requestBody.messages = msgs;
  res.json(requestBody.messages);
});

router.post("/dummy", async (req, res) => {
  const ret = {
    role: "assistant",
    content: "Hello! How can I assist you today?",
  };
  res.json(ret);
});

router.get("/dummy", async (req, res) => {
  const ret = {
    role: "assistant",
    content: "Hello! How can I assist you today?",
  };
  res.json(ret);
});

router.get("/query/:nombr/:naziv/:fnaziv", (req, res) => {
  console.log(req.params);
  res.json(req.params);
});

export { router as default };
