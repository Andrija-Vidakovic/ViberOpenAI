import models from "./models.js";

/**
 * url servera - copletion
 */
const urlCompletion = "https://api.openai.com/v1/chat/completions";

/**
 * url servera - models
 */
const urlModels = "https://api.openai.com/v1/models";

/**********************************************************
 * Osnovna funkcija za chat
 *
 * funkcija je wraper za http metod
 * POST https://api.openai.com/v1/chat/completions
 *
 * @param {*} requestBody objekat sa formatom za upit
 * @returns
 */
async function gptCompletion(requestBody) {
  const response = await fetch(urlCompletion, {
    method: "POST",
    // mode: "cors",
    headers: {
      "Content-Type": "application/json",
      // Authorization: `Bearer ${token.apiKey}`,OPENAI_API_KEY
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify(requestBody),
  });
  return response.json();
}

/**********************************************************
 * Prosirena funkcija za chat. Čuva listu poruka i
 * podržava rad sa funkcijama. Lista sa opisom funkcija
 * je smeštena u requestBody.tools, a stavrne funkcije
 * su u objektu callback.
 *
 * Primer poziva funkcije:
 *  1. Opisi funkcije u request body objektu
 *      requestBody.tools = [opis_f1,opis_f2, ...]
 *  2. Definiši funkcije f1,f2,...
 *  3. Pozovi funkciju: await gptChat(requestBody, {f1,f2,...})
 *
 * @param {*} requestBody telo poruke za OpenAI
 * @param {*} callback  objekat sa funkciiijama koje se pozivaju po zahtevu OpenAI
 * @returns povratna vrednost je requestBody sa azuriranom listom poruka
 */
async function gptChat(requestBody, callback) {
  let resp = await gptCompletion(requestBody);
  let choice = resp.choices[0];
  requestBody.messages.push(choice.message);

  // ponavljaj sve dok je poruka poziv funkcije
  while (choice.finish_reason == "tool_calls") {
    for (let call of choice.message.tool_calls) {
      requestBody.messages.push({
        role: "tool",
        tool_call_id: call.id,
        name: call.function.name,
        // pozovi funkciju da generise sadrzaj
        content: await callback[call.function.name](
          JSON.parse(call.function.arguments)
        ),
      });
    }

    resp = await gptCompletion(requestBody);
    choice = resp.choices[0];
    requestBody.messages.push(choice.message);
  }
  return resp;
}

/**********************************************************
 * funkcija vraca raspolozive modele
 *
 * funkcija je wraper za http metod
 * GET https://api.openai.com/v1/models
 *
 * @returns
 */
async function gptModels() {
  const response = await fetch(urlModels, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
  });
  return response.json();
}

export { gptCompletion, gptModels, gptChat, models };

/*
 * FORMAT PORUKA SA SERVERA
 * 
 
---- povratna vrednost gptCompletion ----
{
  id: 'chatcmpl-8MwIsGTZmAyDT4kOhVJkVzSTBlZ2f',
  object: 'chat.completion',
  created: 1700478026,
  model: 'gpt-3.5-turbo-0613',
  choices: [ { index: 0, message: [Object], finish_reason: 'tool_calls' } ],
  usage: { prompt_tokens: 108, completion_tokens: 16, total_tokens: 124 }
}

---- choices[0].message ----
{
  role: 'assistant',
  content: null,
  tool_calls: [
    {
      id: 'call_0NlJ1uzKkRzXQccqoE1Exbc9',
      type: 'function',
      function: [Object]
    }
  ]
}

---- tool_calls item ----
{
  id: 'call_0NlJ1uzKkRzXQccqoE1Exbc9',
  type: 'function',
  function: { name: 'get_weather', arguments: '{\n  "location": "Sonta"\n}' }
}

*/
